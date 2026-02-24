<?php

namespace App\Modules\Bread;

use Inertia\Facades\Props;
use Spark\Facades\Route;
use Spark\Http\Request;
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
        $query = $model::latest($this->resource::getOrderBy());

        if (!empty($this->resource::getWith())) {
            $query = $query->with(...$this->resource::getWith());
        }

        if ($request->has('search')) {
            $query = $this->resource::applySearch($query, $request->input('search'));
        }

        $query = $this->resource::applyFilters($query, $request);

        $paginated = $query->paginate($request->input('per_page', 10));

        return inertia($this->resource::getPage(), [
            'resource' => Props::once($this->resource::toSchema(...)),
            'paginated' => $paginated,
            ...$this->resource::extraProps(),
        ]);
    }

    // ─── Store ──────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        if ($this->resource::getCreatePerm()) {
            authorize('permission', $this->resource::getCreatePerm());
        }

        [$data, $uploadedFiles] = $this->setupDataForStore($request);

        $model = $this->resource::getModel();
        $record = $model::create($data);

        if ($record->wasCreated()) {
            $this->resource::afterCreate($record, $data);

            return inertia()
                ->back()
                ->with('success', $this->resource::getName() . ' created successfully.');
        }

        // Clean up uploaded files if creation failed
        foreach ($uploadedFiles as $path) {
            @uploader()->delete($path);
        }

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

        [$data] = $this->setupDataForStore($request, $record);

        $record->fill($data);

        if ($record->save()) {
            $this->resource::afterUpdate($record, $data);

            return inertia()
                ->back()
                ->with('success', $this->resource::getName() . ' updated successfully.');
        }

        return inertia()
            ->back()
            ->with('error', 'Failed to update ' . strtolower($this->resource::getName()) . '.');
    }

    // ─── Common Store/Update Logic ─────────────────────────────────────

    protected function setupDataForStore(Request $request, null|\Spark\Database\Model $record = null): array
    {
        // Process file uploads BEFORE validation (replaces $_FILES with paths)
        $uploadedFiles = $this->resource::processFileUploads($request, $record);

        if ($record) {
            $rules = $this->resource::updateRules($record->id) ?? $this->resource::buildRulesFromFields($record->id);
        } else {
            $rules = $this->resource::storeRules() ?? $this->resource::buildRulesFromFields();
        }

        // Remove file field rules if files were uploaded (already processed)
        foreach ($uploadedFiles as $fieldName => $_) {
            unset($rules[$fieldName]);
        }

        $input = $request->validate($rules);
        $data = [...$input->all(), ...$uploadedFiles];

        // Remove any remaining file fields that weren't processed (e.g. optional ones left empty)
        $data = collect($data)
            ->filter(
                fn($value) => !(is_array($value) && isset($value['tmp_name'], $value['tmp_name'], $value['size']))
            )
            ->toArray();

        // Allow Resource to mutate data before creation (e.g. set defaults, generate slugs, etc)
        $data = $this->resource::mutateBeforeCreate($data);

        return [$data, $uploadedFiles];
    }

    // ─── Destroy ────────────────────────────────────────────────────────

    public function destroy(int $id)
    {
        if ($this->resource::getDeletePerm()) {
            authorize('permission', $this->resource::getDeletePerm());
        }

        $model = $this->resource::getModel();
        $record = $model::findOrFail($id);

        $this->resource::beforeDelete($record);

        // Delete associated files
        $this->resource::deleteRecordFiles($record);

        $model::destroy($id);

        return inertia()
            ->back()
            ->with('success', $this->resource::getName() . ' deleted successfully.');
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

        // Built-in delete action (with file cleanup)
        if ($action === 'delete') {
            if ($this->resource::getDeletePerm()) {
                authorize('permission', $this->resource::getDeletePerm());
            }

            $model = $this->resource::getModel();

            // Delete associated files for each record
            if (!empty($this->resource::getFileFields())) {
                $records = $model::whereIn('id', $ids)->get();
                foreach ($records as $record) {
                    $this->resource::deleteRecordFiles($record);
                }
            }

            $model::destroy($ids);

            return inertia()
                ->back()
                ->with('success', 'Selected ' . $this->resource::getTitle() . ' deleted successfully.');
        }

        // Try resource custom handler first
        $result = $this->resource::handleBulkAction($action, $ids);
        if ($result !== null) {
            return $result;
        }

        // Check if it's a status-change bulk action with custom column
        $bulkActions = $this->resource::bulkActions();
        $matchedAction = null;
        foreach ($bulkActions as $ba) {
            $baArr = method_exists($ba, 'toArray') ? $ba->toArray() : $ba;
            if (($baArr['action'] ?? '') === $action) {
                $matchedAction = $baArr;
                break;
            }
        }

        if ($this->resource::getEditPerm()) {
            authorize('permission', $this->resource::getEditPerm());
        }

        $model = $this->resource::getModel();
        $column = $matchedAction['statusColumn'] ?? 'status';
        $model::whereIn('id', $ids)->update([$column => $action]);

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
     */
    public static function routes(string $resourceClass): void
    {
        $slug = $resourceClass::getSlug();
        $controller = new static($resourceClass);

        Route::post("$slug/bulk-action", [$controller, 'bulkAction']);
        Route::get($slug, [$controller, 'index']);
        Route::post($slug, [$controller, 'store']);
        Route::put("$slug/{id}", [$controller, 'update']);
        Route::delete("$slug/{id}", [$controller, 'destroy']);
    }
}
