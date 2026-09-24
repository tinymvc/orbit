<?php

namespace App\Services\Bread;

use App\Services\Bread\Form;
use Spark\Facades\Route;
use Spark\Facades\Disk;
use Spark\Foundation\Application;
use Spark\Http\Request;
use Spark\Http\Routing\RouteGroup;
use function is_array;

/**
 * Generic BREAD controller.
 *
 * Paired with a Resource subclass, this handles index / store / update /
 * destroy / bulkAction for ANY model — zero per-model controllers needed.
 *
 * Supports automatic file upload processing via the Resource's file fields.
 *
 * Usage in routes:
 *   ResourceController::routes(PostsResource::class);
 * 
 * @author Shahin Moyshan <shahin.moyshan2@gmail.com>
 */
class ResourceController
{
    /**
     * @param class-string<Resource> $resource
     */
    public function __construct(protected string $resource)
    {
    }

    // ─── Index ──────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        if ($this->resource::getBrowsePerm()) {
            authorize('permission', $this->resource::getBrowsePerm());
        }

        $model = $this->resource::getModel();
        $input = $request->validate([
            'trashed' => 'nullable|in:without,with,only',
            'sort' => 'nullable|string',
            'direction' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:500|regex:/^[1-9][0-9]*$/',
            'page' => 'nullable|integer|min:1|regex:/^[1-9][0-9]*$/',
            'search' => 'nullable|string',
        ]);
        $sort = $input['sort'] ?: $this->resource::getOrderBy();
        if ($input['sort'] && !in_array($sort, $this->resource::sortableColumns(), true)) {
            return $request->prepareValidationError('This column cannot be sorted.', ['sort' => ['This column cannot be sorted.']]);
        }
        $direction = $input['sort'] ? ($input['direction'] ?: 'asc') : $this->resource::getOrderDirection();
        $query = $model::orderBy($sort, $direction);

        if ($this->resource::usesSoftDeletes()) {
            $query = match ($input['trashed']) {
                'with' => $query->withTrashed(),
                'only' => $query->onlyTrashed(),
                default => $query->withoutTrashed(),
            };
        }

        if (!empty($this->resource::getWith())) {
            $query = $query->with(...$this->resource::getWith());
        }

        if ($request->has('search')) {
            $query = $this->resource::applySearch($query, $request->input('search'));
        }

        try {
            $query = $this->resource::applyFilters($query, $request);
        } catch (\InvalidArgumentException $error) {
            return $request->prepareValidationError($error->getMessage(), ['filters' => [$error->getMessage()]]);
        }

        return inertia($this->resource::getPage(), [
            'resource' => $this->resource::toSchema(...),
            'dynamicOptions' => $this->resource::dynamicProps(...),
            'paginated' => function () use ($query, $input) {
                $page = new Paginator($query->count(), (int) ($input['per_page'] ?: 10), (int) ($input['page'] ?: 1));
                return $page->setData($query->limit($page->offset(), $page->limit())->all())
                    ->map($this->resource::recordWithFileUrls(...));
            },
        ]);
    }

    /** Serve only keys attached to this record, using its server-selected disk. */
    public function file(int $id, Request $request)
    {
        if ($this->resource::getBrowsePerm())
            authorize('permission', $this->resource::getBrowsePerm());
        $input = $request->validate(['field' => 'required|string', 'path' => 'required|string']);
        $model = $this->resource::getModel();
        $record = $this->resource::usesSoftDeletes()
            ? $model::withTrashed()->findOrFail($id) : $model::findOrFail($id);
        foreach ($this->resource::getFileFields() as $field) {
            if ($field->getName() !== $input['field'])
                continue;
            $path = $input['path'];
            abort_unless(in_array($path, $this->resource::filePaths($field, $record->{$field->getName()}), true), 404);
            abort_if((bool) preg_match('#^https?://#i', $path), 404);
            $disk = Disk::disk($field->getDisk());
            $diskName = $field->getDisk() ?? config('disk.default');
            if (config("disk.disks.$diskName.driver") === 's3') {
                return redirect($disk->temporaryUrl($path, 300));
            }
            abort_unless($disk->exists($path), 404);
            $mime = $disk->mimeType($path);
            $inline = in_array($mime, ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'], true);
            return new FileResponse($disk->path($path), [
                'Content-Type' => $mime,
                'Content-Disposition' => ($inline ? 'inline' : 'attachment') . "; filename*=UTF-8''" . rawurlencode(basename($path)),
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store',
            ]);
        }
        abort(404);
    }

    // ─── Store ──────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        if ($this->resource::getCreatePerm()) {
            authorize('permission', $this->resource::getCreatePerm());
        }

        $relationData = $this->resource::extractRelationshipData($request);
        try {
            [$data, $uploadedFiles] = $this->setupDataForStore($request);
        } catch (UploadException $error) {
            return $request->prepareValidationError($error->getMessage(), [$error->field => [$error->getMessage()]]);
        }

        $model = $this->resource::getModel();
        try {
            $record = $model::create($data);
        } catch (\Throwable $e) {
            $this->resource::cleanUpFileChanges($uploadedFiles, saved: false);
            throw $e;
        }

        if ($record->wasCreated()) {
            // Sync belongsToMany relationships
            if (!empty($relationData)) {
                $this->resource::syncRelationships($record, $relationData);
            }

            $this->resource::afterCreate($record, $data);

            return inertia()
                ->back()
                ->with('success', $this->resource::getName() . ' created successfully.');
        }

        // Clean up uploaded files if creation failed
        $this->resource::cleanUpFileChanges($uploadedFiles, saved: false);

        return inertia()
            ->back()
            ->with('error', 'Failed to create ' . strtolower($this->resource::getName()) . '.');
    }

    // ─── Update ─────────────────────────────────────────────────────────

    public function update(int $id, Request $request)
    {
        if ($this->resource::getEditPerm()) {
            authorize('permission', $this->resource::getEditPerm());
        }

        $model = $this->resource::getModel();
        $record = $model::findOrFail($id);

        $relationData = $this->resource::extractRelationshipData($request);
        try {
            [$data, $uploadedFiles] = $this->setupDataForStore($request, $record);
        } catch (UploadException $error) {
            return $request->prepareValidationError($error->getMessage(), [$error->field => [$error->getMessage()]]);
        }

        $original = clone $record;
        $record->fill($data);

        try {
            $saved = $record->save();
        } catch (\Throwable $e) {
            $this->resource::cleanUpFileChanges($uploadedFiles, $original, saved: false);
            throw $e;
        }

        if ($saved) {
            $this->resource::cleanUpFileChanges($uploadedFiles, $original);
            // Sync belongsToMany relationships
            if (!empty($relationData)) {
                $this->resource::syncRelationships($record, $relationData);
            }

            $this->resource::afterUpdate($record, $data);

            return inertia()
                ->back()
                ->with('success', $this->resource::getName() . ' updated successfully.');
        }

        // Clean up uploaded files if creation failed
        $this->resource::cleanUpFileChanges($uploadedFiles, $original, saved: false);

        return inertia()
            ->back()
            ->with('error', 'Failed to update ' . strtolower($this->resource::getName()) . '.');
    }

    // ─── Common Store/Update Logic ─────────────────────────────────────

    protected function setupDataForStore(Request $request, null|\Spark\Database\Model $record = null): array
    {
        if ($record) {
            $rules = $this->resource::updateRules($record->id) ?? $this->resource::buildRulesFromFields($record->id);
        } else {
            $rules = $this->resource::storeRules() ?? $this->resource::buildRulesFromFields();
        }

        // Upload paths are managed by the resource, never accepted as arbitrary input.
        foreach ($this->resource::getFileFields() as $field) {
            $name = $field->getName();
            if (
                $field->isRequired() && !$request->hasFile($name)
                && (!$record || empty($record->{$name}) || ($request->has($name) && empty($request->input($name))))
            ) {
                $request->mergePostParams([$name => null]);
                $request->validate([$name => 'required']);
            }
            unset($rules[$name]);
        }

        // Remove relationship field rules (handled via sync)
        foreach ($this->resource::getRelationshipFields() as $relField) {
            unset($rules[$relField->getName()]);
        }

        $input = $request->validate($rules);
        $uploadedFiles = $this->resource::processFileUploads($request, $record);
        $data = [...$input->all(), ...$uploadedFiles];

        // Remove any remaining file fields that weren't processed (e.g. optional ones left empty)
        $data = collect($data)
            ->filter(
                fn($value) => !(is_array($value) && isset($value['tmp_name'], $value['name'], $value['size']))
            )
            ->toArray();

        // Allow Resource to mutate data before creation (e.g. set defaults, generate slugs, etc)
        try {
            $data = $record
                ? $this->resource::mutateBeforeUpdate($data, $record)
                : $this->resource::mutateBeforeCreate($data);
        } catch (\Throwable $error) {
            $this->resource::cleanUpFileChanges($uploadedFiles, $record, saved: false);
            throw $error;
        }

        return [$data, $uploadedFiles];
    }

    // ─── Search (Ajax for Combobox) ──────────────────────────────────────

    /**
     * Handle AJAX search requests for Combobox fields with a searchRoute.
     *
     * GET /admin/{slug}/search?field=categories&query=tech
     *
     * Returns JSON: [ { value: "1", label: "Tech" }, ... ]
     */
    public function search(Request $request)
    {
        if ($this->resource::getBrowsePerm()) {
            authorize('permission', $this->resource::getBrowsePerm());
        }

        $fieldName = $request->input('field', '');
        $query = $request->input('query', '');

        // Find the matching Combobox field with a searchRoute
        $combobox = null;
        foreach ($this->resource::fields() as $field) {
            if ($field instanceof Form\Combobox && $field->getName() === $fieldName) {
                $combobox = $field;
                break;
            }
        }

        if (!$combobox) {
            return json(['error' => 'Field not found'], 404);
        }

        // Non-relationship combobox — for now, return static options filtered
        if (!$combobox->isRelationship()) {
            return json([]);
        }

        // Use the relationship's related model
        $parentModel = $this->resource::getModel();
        $relationName = $combobox->getRelationName();
        $relation = (new $parentModel)->$relationName();
        $relatedModel = $relation->getConfig()['related'];
        $valueKey = $combobox->getRelationValueKey() ?: 'id';
        $labelKey = $combobox->getRelationLabelKey() ?: 'name';
        $selectKeys = $combobox->getSelectKeys() ?: [$valueKey, $labelKey];
        $searchKeys = $combobox->getSearchKeys() ?: [$labelKey];

        // Query the related model
        $builder = $relatedModel::select($selectKeys);

        if ($query !== '') {
            Resource::applySearch($builder, $query, is_array($searchKeys) ? $searchKeys : array_map('trim', explode(',', $searchKeys)));
        }

        $options = $builder->orderBy($labelKey)
            ->limit(50)
            ->get()
            ->map(fn($row) => [
                'value' => (string) $row->{$valueKey},
                'label' => $row->{$labelKey},
            ])->all();

        return json($options);
    }

    // ─── Destroy ────────────────────────────────────────────────────────

    public function destroy(int $id)
    {
        if ($this->resource::getDeletePerm()) {
            authorize('permission', $this->resource::getDeletePerm());
        }

        $model = $this->resource::getModel();
        $record = $model::findOrFail($id);

        $this->deleteRecord($record);

        return inertia()->back()->with('success', $this->resource::getName()
            . ($this->resource::usesSoftDeletes() ? ' moved to trash.' : ' deleted successfully.'));
    }

    public function restore(int $id)
    {
        abort_unless($this->resource::usesSoftDeletes(), 404);
        if ($permission = $this->resource::getRestorePerm())
            authorize('permission', $permission);
        $model = $this->resource::getModel();
        $this->restoreRecord($model::onlyTrashed()->findOrFail($id));
        return inertia()->back()->with('success', $this->resource::getName() . ' restored successfully.');
    }

    public function forceDelete(int $id)
    {
        abort_unless($this->resource::usesSoftDeletes(), 404);
        if ($permission = $this->resource::getForceDeletePerm())
            authorize('permission', $permission);
        $model = $this->resource::getModel();
        $this->deleteRecord($model::onlyTrashed()->findOrFail($id), permanent: true);
        return inertia()->back()->with('success', $this->resource::getName() . ' permanently deleted.');
    }

    protected function deleteRecord(\Spark\Database\Model $record, bool $permanent = false): void
    {
        $model = $this->resource::getModel();
        $permanent ? $this->resource::beforeForceDelete($record) : $this->resource::beforeDelete($record);
        $deleted = $permanent
            ? $model::onlyTrashed()->where('id', $record->id)->forceDelete()
            : $record->remove();
        if (!$deleted)
            throw new \RuntimeException('The record could not be deleted.');
        // Keep uploads for restore. Remove them only after successful physical deletion.
        if ($permanent || !$this->resource::usesSoftDeletes())
            $this->resource::deleteRecordFiles($record);
    }

    protected function restoreRecord(\Spark\Database\Model $record): void
    {
        $this->resource::beforeRestore($record);
        if (!$record->restore())
            throw new \RuntimeException('The record could not be restored.');
        $this->resource::afterRestore($record);
    }

    // ─── Bulk Action ────────────────────────────────────────────────────

    public function bulkAction(Request $request)
    {
        $input = $request->validate([
            'action' => 'required|string',
            'ids' => 'required|array|min:1',
        ]);

        $action = $input->string('action');
        $ids = $input->array('ids');

        if (
            count($ids) > 500 || array_filter($ids, fn($id) =>
                (!is_int($id) && !is_string($id)) || !preg_match('/^[1-9][0-9]*$/', (string) $id))
        ) {
            return $request->prepareValidationError('Invalid record selection.', ['ids' => ['Select between 1 and 500 valid record IDs.']]);
        }
        $ids = array_values(array_unique(array_map('intval', $ids)));
        $model = $this->resource::getModel();

        if (in_array($action, ['delete', 'restore', 'force-delete'], true)) {
            if ($action !== 'delete')
                abort_unless($this->resource::usesSoftDeletes(), 404);
            $permission = match ($action) {
                'restore' => $this->resource::getRestorePerm(),
                'force-delete' => $this->resource::getForceDeletePerm(),
                default => $this->resource::getDeletePerm(),
            };
            if ($permission)
                authorize('permission', $permission);
            $query = $model::whereIn('id', $ids);
            if ($action !== 'delete')
                $query->onlyTrashed();
            $records = $query->get();
            foreach ($records as $record) {
                $action === 'restore' ? $this->restoreRecord($record)
                    : $this->deleteRecord($record, permanent: $action === 'force-delete');
            }
            $message = match ($action) {
                'restore' => 'restored',
                'force-delete' => 'permanently deleted',
                default => $this->resource::usesSoftDeletes() ? 'moved to trash' : 'deleted',
            };
            return inertia()->back()->with('success', count($records) . ' records ' . $message . '.');
        }

        // Custom/status actions only receive active IDs, even from a mixed selection.
        if ($permission = $this->resource::getEditPerm())
            authorize('permission', $permission);
        $ids = $model::whereIn('id', $ids)->get()->map(fn($record) => $record->id)->all();
        if (!$ids)
            return inertia()->back()->with('info', 'No active records selected.');

        // Try resource custom handler first
        $result = $this->resource::handleBulkAction($action, $ids);
        if ($result !== null) {
            return $result;
        }

        // Check if it's a status-change bulk action with custom column
        $bulkActions = $this->resource::bulkActions();
        $matchedAction = null;
        foreach ($bulkActions as $ba) {
            if ($ba->getAction() === $action) {
                $matchedAction = $ba;
                break;
            }
        }

        if (!$matchedAction)
            return $request->prepareValidationError('Unknown bulk action.', ['action' => ['Unknown bulk action.']]);

        $callback = $matchedAction->getCallback();
        if ($callback) {
            Application::$app->call($callback, ['ids' => $ids]);
        } else {
            $model::whereIn('id', $ids)->update([
                $matchedAction->getStatusColumn() ?: 'status' => $action
            ]);
        }

        return inertia()
            ->back()
            ->with('success', 'Selected ' . $this->resource::getTitle() . ' updated successfully.');
    }

    // ─── Route Registration Helper ──────────────────────────────────────

    /**
     * Register all BREAD routes for a Resource class.
     *
     * Call from routes/web.php:
     *   ResourceController::routes(PostsResource::class);
     *
     * Registers:
     *   GET    /admin/{slug}             → index
     *   POST   /admin/{slug}             → store
     *   PUT    /admin/{slug}/{id}        → update
     *   DELETE /admin/{slug}/{id}        → destroy
     *   POST   /admin/{slug}/bulk-action → bulkAction
     *   GET    /admin/{slug}/search      → search (for Combobox AJAX)
     * 
     * @param class-string<Resource> $resourceClass
     * 
     * @return RouteGroup The route group instance (in case you want to configure middleware, etc)
     */
    public static function routes(string $resourceClass): RouteGroup
    {
        return Route::group(function () use ($resourceClass) {
            // Derive slug and name from Resource class
            $slug = $resourceClass::getSlug();
            $name = str_replace('/', '.', $slug);

            // Instantiate controller with the Resource class
            $controller = new static($resourceClass);

            // Register routes
            Route::post("$slug/bulk-action", [$controller, 'bulkAction'])
                ->name("$name.actions");

            Route::get("$slug/search", [$controller, 'search'])
                ->name("$name.search");

            Route::get($slug, [$controller, 'index'])
                ->name("$name.index");

            Route::post($slug, [$controller, 'store'])
                ->name("$name.store");

            Route::get("$slug/{id}/file", [$controller, 'file'])->name("$name.file");

            if ($resourceClass::usesSoftDeletes()) {
                Route::post("$slug/{id}/restore", [$controller, 'restore'])->name("$name.restore");
                Route::delete("$slug/{id}/force-delete", [$controller, 'forceDelete'])->name("$name.force-delete");
            }

            Route::put("$slug/{id}", [$controller, 'update'])
                ->name("$name.update");

            Route::delete("$slug/{id}", [$controller, 'destroy'])
                ->name("$name.destroy");
        }); // ->middleware('auth') // You can apply middleware to the whole group if needed
    }
}
