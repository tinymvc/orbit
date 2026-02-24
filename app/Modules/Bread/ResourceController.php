<?php

namespace App\Modules\Bread;

use Inertia\Facades\Props;
use Spark\Facades\Route;
use Spark\Http\Request;
use Spark\Support\Str;

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
    /** @var class-string<Resource> */
    protected string $resource;

    public function __construct(string $resource)
    {
        $this->resource = $resource;
    }

    // ─── Index ──────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $resource = $this->resource;

        if ($resource::getBrowsePerm()) {
            authorize('permission', $resource::getBrowsePerm());
        }

        $model = $resource::getModel();
        $query = $model::latest($resource::getOrderBy());

        if (!empty($resource::getWith())) {
            $query = $query->with(...$resource::getWith());
        }

        if ($request->has('search')) {
            $query = $resource::applySearch($query, $request->input('search'));
        }

        $query = $resource::applyFilters($query, $request);

        $paginated = $query->paginate($request->input('per_page', 10));

        return inertia($resource::getPage(), [
            'resource' => Props::once($resource::toSchema(...)),
            'paginated' => $paginated,
            ...$resource::extraProps(),
        ]);
    }

    // ─── Store ──────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $resource = $this->resource;

        if ($resource::getCreatePerm()) {
            authorize('permission', $resource::getCreatePerm());
        }

        // Process file uploads BEFORE validation (replaces $_FILES with paths)
        $uploadedFiles = $resource::processFileUploads($request);

        $rules = $resource::storeRules() ?? $resource::buildRulesFromFields();

        // Remove file field rules if files were uploaded (already processed)
        foreach ($uploadedFiles as $fieldName => $_) {
            unset($rules[$fieldName]);
        }

        $input = $request->validate($rules);
        $data = [...$input->all(), ...$uploadedFiles];
        $data = $resource::mutateBeforeCreate($data);

        $model = $resource::getModel();
        $record = $model::create($data);

        if ($record->wasCreated()) {
            $resource::afterCreate($record, $data);

            return inertia()
                ->back()
                ->with('success', $resource::getName() . ' created successfully.');
        }

        // Clean up uploaded files if creation failed
        foreach ($uploadedFiles as $path) {
            @uploader()->delete($path);
        }

        return inertia()
            ->back()
            ->with('error', 'Failed to create ' . strtolower($resource::getName()) . '.');
    }

    // ─── Update ─────────────────────────────────────────────────────────

    public function update(int $id, Request $request)
    {
        $resource = $this->resource;

        if ($resource::getEditPerm()) {
            authorize('permission', $resource::getEditPerm());
        }

        $model = $resource::getModel();
        $record = $model::findOrFail($id);

        // Process file uploads (deletes old files automatically)
        $uploadedFiles = $resource::processFileUploads($request, $record);

        $rules = $resource::updateRules($id) ?? $resource::buildRulesFromFields($id);

        foreach ($uploadedFiles as $fieldName => $_) {
            unset($rules[$fieldName]);
        }

        $input = $request->validate($rules);
        $data = [...$input->all(), ...$uploadedFiles];
        $data = $resource::mutateBeforeUpdate($data, $record);

        $record->fill($data);

        if ($record->save()) {
            $resource::afterUpdate($record, $data);

            return inertia()
                ->back()
                ->with('success', $resource::getName() . ' updated successfully.');
        }

        return inertia()
            ->back()
            ->with('error', 'Failed to update ' . strtolower($resource::getName()) . '.');
    }

    // ─── Destroy ────────────────────────────────────────────────────────

    public function destroy(int $id)
    {
        $resource = $this->resource;

        if ($resource::getDeletePerm()) {
            authorize('permission', $resource::getDeletePerm());
        }

        $model = $resource::getModel();
        $record = $model::findOrFail($id);

        $resource::beforeDelete($record);

        // Delete associated files
        $resource::deleteRecordFiles($record);

        $model::destroy($id);

        return inertia()
            ->back()
            ->with('success', $resource::getName() . ' deleted successfully.');
    }

    // ─── Bulk Action ────────────────────────────────────────────────────

    public function bulkAction(Request $request)
    {
        $resource = $this->resource;

        $input = $request->validate([
            'action' => 'required|string',
            'ids' => 'required|array|min:1',
        ]);

        $action = $input->string('action');
        $ids = $input->array('ids');

        // Built-in delete action (with file cleanup)
        if ($action === 'delete') {
            if ($resource::getDeletePerm()) {
                authorize('permission', $resource::getDeletePerm());
            }

            $model = $resource::getModel();

            // Delete associated files for each record
            if (!empty($resource::getFileFields())) {
                $records = $model::whereIn('id', $ids)->get();
                foreach ($records as $record) {
                    $resource::deleteRecordFiles($record);
                }
            }

            $model::destroy($ids);

            return inertia()
                ->back()
                ->with('success', 'Selected ' . Str::plural(strtolower($resource::getName())) . ' deleted successfully.');
        }

        // Try resource custom handler first
        $result = $resource::handleBulkAction($action, $ids);
        if ($result !== null) {
            return $result;
        }

        // Check if it's a status-change bulk action with custom column
        $bulkActions = $resource::bulkActions();
        $matchedAction = null;
        foreach ($bulkActions as $ba) {
            $baArr = method_exists($ba, 'toArray') ? $ba->toArray() : $ba;
            if (($baArr['action'] ?? '') === $action) {
                $matchedAction = $baArr;
                break;
            }
        }

        if ($resource::getEditPerm()) {
            authorize('permission', $resource::getEditPerm());
        }

        $model = $resource::getModel();
        $column = $matchedAction['statusColumn'] ?? 'status';
        $model::whereIn('id', $ids)->update([$column => $action]);

        return inertia()
            ->back()
            ->with('success', 'Selected ' . Str::plural(strtolower($resource::getName())) . ' updated successfully.');
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
