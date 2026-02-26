<?php

namespace App\Modules\Bread;

use App\Modules\Bread\Form\Combobox;
use App\Modules\Bread\Form\Field;
use App\Modules\Bread\Table\BulkAction;
use App\Modules\Bread\Table\Column;
use App\Modules\Bread\Table\Filter;
use Spark\Contracts\Support\Arrayable;
use Spark\Database\Model;
use Spark\Database\QueryBuilder;
use Spark\Foundation\Application;
use Spark\Http\Request;
use function count;
use function in_array;
use function is_array;

/**
 * Abstract base for all BREAD resources.
 * 
 * This class defines the core structure and functionality for BREAD resources.
 * Each resource represents a CRUD interface for a specific Eloquent model.
 * 
 * To create a new resource, simply extend this class and implement the abstract methods.
 * The resource class handles schema definition, permissions, file uploads, and more.
 * The corresponding controller and frontend page are generated automatically.
 * 
 * @author Shahin Moyshan <shahin.moyshan2@gmail.com>
 */
abstract class Resource
{
    // ─── Core ───────────────────────────────────────────────────────────

    /** @param class-string<Model> $model Eloquent model class */
    protected static string $model;

    /** Singular display name  (e.g. "Post") */
    protected static string $name;

    /** Plural / page title (e.g. "Posts"). Auto-generated if omitted. */
    protected static null|string $title = null;

    /** Page description shown below the title */
    protected static null|string $description = null;

    /** Inertia page component path — defaults to "admin/table" (generic page) */
    protected static string $page = 'admin/table';

    /** Route prefix used for the URL, e.g. "posts" → "/admin/posts" */
    protected static string $slug;

    /** Relationships to eager-load on the index query */
    protected static array $with = [];

    /** Searchable columns — used by the generic search handler */
    protected static array $searchable = [];

    /** Order column and direction */
    protected static string $orderBy = 'id';
    protected static string $orderDirection = 'desc';

    /** URL prefix for all resources. */
    protected static string $urlPrefix = '/admin/';

    // ─── Permissions ────────────────────────────────────────────────────

    /** Permission keys (Filament-style). Set to null to disable a check. */
    protected static null|string $browsePerm = null;
    protected static null|string $createPerm = null;
    protected static null|string $editPerm = null;
    protected static null|string $deletePerm = null;

    // ─── Drawer / Sheet ─────────────────────────────────────────────────

    /** Sheet/drawer width on desktop: sm | md | lg | xl | 2xl */
    protected static string $drawerWidth = 'md';

    // ─── Disabled features ──────────────────────────────────────────────

    /** Features to disable: "search", "columns", "add_record" */
    protected static array $disabled = [];

    // ─── Schema definitions (return Field[], Column[], etc.) ────────────

    /**
     * Define form fields using fluent Field builders.
     *
     * @return Field[]
     */
    abstract public static function fields(): array;

    /**
     * Define table columns using fluent Column builders.
     *
     * @return Column[]
     */
    abstract public static function columns(): array;

    /**
     * Define server-side filters using fluent Filter builders.
     *
     * @return Filter[]
     */
    public static function filters(): array
    {
        return [];
    }

    /**
     * Define bulk actions using fluent BulkAction builders.
     *
     * @return BulkAction[]
     */
    public static function bulkActions(): array
    {
        return [];
    }

    // ─── Dynamic data & hooks ─────────────────────────────────────────────

    /**
     * Dynamic data (props) to pass alongside the resource schema.
     * e.g. author list, categories, etc.
     */
    public static function dynamicProps(): array
    {
        return [];
    }

    /**
     * Validation rules for store (create).
     * Return null to auto-generate from fields.
     */
    public static function storeRules(): null|array
    {
        return null;
    }

    /**
     * Validation rules for update.
     * Return null to auto-generate from fields.
     */
    public static function updateRules(int $id): null|array
    {
        return null;
    }

    /**
     * Apply filters to the query based on request parameters.
     * Default implementation uses the filter key as a column name with WHERE =.
     */
    public static function applyFilters(QueryBuilder $query, Request $request)
    {
        foreach (static::filters() as $filter) {
            // If the filter has a custom callback, call it with the query and request.
            if ($filter instanceof Filter && $request->has($filter->getKey()) && ($callback = $filter->getCallback()) !== null) {
                Application::$app->call(
                    $callback,
                    ['query' => $query, 'value' => $request->input($filter->getKey())]
                );
                continue; // Skip default handling if callback is defined
            }

            $key = $filter instanceof Filter ? $filter->getKey() : ($filter['key'] ?? '');
            if ($request->has($key)) {
                $query = $query->where($key, $request->input($key));
            }
        }
        return $query;
    }

    /**
     * Apply search to the query.
     */
    public static function applySearch(QueryBuilder $query, string $search, null|array $cols = null)
    {
        $cols ??= static::$searchable;

        if (empty($cols)) {
            return $query;
        }

        if (count($cols) === 1) {
            return $query->like($cols[0], "%$search%");
        }

        $concatExpr = 'CONCAT(' . implode(', " ", ', $cols) . ')';
        $conditions = implode(
            ' OR ',
            array_map(fn($c) => "$c LIKE :search", $cols)
        );
        $conditions .= " OR $concatExpr LIKE :search";

        return $query->whereRaw($conditions, ['search' => "%$search%"]);
    }

    /**
     * Mutate form data before creating a new record.
     */
    public static function mutateBeforeCreate(array $data): array
    {
        return $data;
    }

    /** Hook called after a record has been created. */
    public static function afterCreate($record, array $data): void
    {
    }

    /**
     * Mutate form data before updating an existing record.
     */
    public static function mutateBeforeUpdate(array $data, $record): array
    {
        return $data;
    }

    /** Hook called after a record has been updated. */
    public static function afterUpdate($record, array $data): void
    {
    }

    /** Hook called before a record is deleted. */
    public static function beforeDelete($record): void
    {
    }

    /**
     * Handle a custom bulk action.
     * Return an Inertia response or null for default handling.
     */
    public static function handleBulkAction(string $action, array $ids)
    {
        return null;
    }

    /**
     * Default column visibility (hidden columns).
     */
    public static function initialColumnVisibility(): array
    {
        // Auto-generate from columns that have visible = false
        $visibility = [];
        foreach (static::columns() as $col) {
            if ($col instanceof Column) {
                if (!$col->isVisible()) {
                    $visibility[$col->getKey()] = false;
                }
            }
        }
        return $visibility;
    }

    /** Translation string overrides. */
    public static function translations(): array
    {
        return [];
    }

    // ─── File Upload Helpers ────────────────────────────────────────────

    /**
     * Get all file upload fields from the field definitions.
     *
     * @return Field[]
     */
    public static function getFileFields(): array
    {
        return array_filter(
            static::fields(),
            fn(Field $f) => $f->isFileUpload()
        );
    }

    /**
     * Process file uploads from the request.
     * Returns an array of [fieldName => uploadedPath] entries.
     * Call this before validation — it replaces file data with the stored path.
     */
    public static function processFileUploads(Request $request, null|Model $existingRecord = null): array
    {
        $uploadedFiles = [];

        foreach (static::getFileFields() as $field) {
            $name = $field->getName();

            // Initialize uploader with field settings (upload path, accepted types, etc.)
            $uploader = uploader(
                uploadTo: $field->getUploadTo(),
                extensions: $field->getAcceptedTypes(),
                maxSize: $field->getMaxFileSize(),
                compress: $field->getCompress(),
                resize: $field->getResize(),
            );

            // ── Multiple file upload ────────────────────────────────────
            if ($field->isMultiple()) {
                $existingPaths = [];
                if ($existingRecord && !empty($existingRecord->{$name})) {
                    $raw = $existingRecord->{$name};
                    $existingPaths = is_array($raw) ? $raw : (array) json_decode($raw, true);
                }

                // Collect paths the client sent back (existing files to keep)
                $inputValue = $request->post($name, []);
                $keptPaths = is_array($inputValue) ? array_filter($inputValue, 'is_string') : [];

                // Delete removed files (existing paths not in kept list)
                foreach ($existingPaths as $oldPath) {
                    if (!in_array($oldPath, $keptPaths, true)) {
                        $uploader->delete($oldPath);
                    }
                }

                // Upload new files
                $newPaths = [];
                if ($request->hasFile($name)) {
                    $uploader->multiple = true;
                    $newPaths = (array) $uploader->upload($name);
                }

                $uploadedFiles[$name] = array_values([...$keptPaths, ...$newPaths]);
                continue;
            }

            // ── Single file upload ────────────────────

            // New file uploaded — handle upload + old file cleanup
            if ($request->hasFile($name)) {
                // Delete old file on update
                if ($existingRecord && !empty($existingRecord->{$name})) {
                    $uploader->delete($existingRecord->{$name});
                }

                // Upload new file
                $path = $uploader->upload($name);

                $uploadedFiles[$name] = $path;
                continue;
            }

            // Check the submitted value for this file field
            $inputValue = $request->input($name);

            // If the input matches the existing file path → no change, skip entirely
            if ($existingRecord && $inputValue === $existingRecord->{$name}) {
                continue;
            }

            // Empty string or null → user explicitly removed the file
            if (
                $existingRecord
                && !empty($existingRecord->{$name})
                && ($inputValue === '' || $inputValue === null)
            ) {
                $uploader->delete($existingRecord->{$name});
                $uploadedFiles[$name] = null;
            }
        }

        return $uploadedFiles;
    }

    /**
     * Delete all uploaded files for a record.
     */
    public static function deleteRecordFiles(Model $record): void
    {
        foreach (static::getFileFields() as $field) {
            $name = $field->getName();
            if (!empty($record->{$name})) {
                $value = $record->{$name};
                $up = uploader(uploadTo: $field->getUploadTo());
                if (is_array($value)) {
                    foreach ($value as $path) {
                        $up->delete($path);
                    }
                } else {
                    $up->delete($value);
                }
            }
        }
    }

    // ─── Relationship (BelongsTo / BelongsToMany) Helpers ─────────────

    /**
     * Get all Combobox fields configured with a belongsToMany relationship.
     * These need pivot sync() — belongsTo fields store FK directly on the model.
     *
     * @return Combobox[]
     */
    public static function getRelationshipFields(): array
    {
        return array_filter(
            static::fields(),
            fn(Field $f) => $f instanceof Combobox && $f->isBelongsToMany()
        );
    }

    /**
     * Sync belongsToMany relationships from submitted form data.
     * Call AFTER the record has been created/updated.
     *
     * @param Model $record       The saved model instance.
     * @param array $data         The submitted form data.
     */
    public static function syncRelationships(Model $record, array $data): void
    {
        foreach (static::getRelationshipFields() as $field) {
            /** @var Combobox $field */
            $name = $field->getName();
            $relationName = $field->getRelationName();

            if (!method_exists($record, $relationName)) {
                continue;
            }

            $ids = $data[$name] ?? [];
            if (!is_array($ids)) {
                $ids = array_filter([$ids]);
            }

            // Cast to integers for ID-based relations
            $ids = array_map('intval', array_filter($ids));

            $record->$relationName()->sync($ids);
        }
    }

    /**
     * Strip relationship field data from the main data array.
     * These fields don't belong on the model's table — they go into pivot tables.
     */
    public static function extractRelationshipData(Request $request): array
    {
        $relationData = [];
        foreach (static::getRelationshipFields() as $field) {
            $name = $field->getName();
            if ($request->has($name)) {
                $relationData[$name] = $request[$name]; // Keep the raw input for syncing later
            }
        }
        return $relationData;
    }

    // ─── Auto-generate validation rules from fields ─────────────────────

    /**
     * Build validation rules from the Field objects.
     */
    public static function buildRulesFromFields(null|int $id = null): array
    {
        $rules = [];

        foreach (static::fields() as $field) {
            if (!$field instanceof Field)
                continue;

            $rule = $field->toValidationRule($id);
            if ($rule !== null) {
                $rules[$field->getName()] = $rule;
            }
        }

        return $rules;
    }

    // ─── Schema Serialisation (sent to frontend) ────────────────────────

    /**
     * Serialise a list of fluent objects to arrays.
     */
    protected static function serialise(array $items): array
    {
        return array_map(
            fn($item) => $item instanceof Arrayable
            ? $item->toArray()
            : $item,
            $items
        );
    }

    /**
     * Build the full config array sent to the frontend as Inertia props.
     */
    public static function toSchema(): array
    {
        return [
            'name' => static::$name,
            'title' => static::getTitle(),
            'description' => static::$description,
            'url' => static::getUrl(),

            'fields' => static::serialise(static::fields()),
            'columns' => static::serialise(static::columns()),
            'filters' => static::serialise(static::filters()),
            'bulkActions' => static::serialise(static::bulkActions()),

            'permissions' => [
                'browse' => static::$browsePerm,
                'create' => static::$createPerm,
                'edit' => static::$editPerm,
                'delete' => static::$deletePerm,
            ],

            'drawerWidth' => static::$drawerWidth,
            'disabled' => static::$disabled,
            'initialColumnVisibility' => static::initialColumnVisibility(),
            'translations' => static::translations(),
        ];
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public static function getModel(): string
    {
        return static::$model;
    }

    public static function getSlug(): string
    {
        return static::$slug;
    }

    public static function getName(): string
    {
        return static::$name;
    }

    public static function getTitle(): string
    {
        return static::$title ?? str(self::$name)->plural();
    }

    public static function getUrl(): string
    {
        return self::$urlPrefix . static::$slug;
    }

    public static function getPage(): string
    {
        return static::$page;
    }

    public static function getWith(): array
    {
        return static::$with;
    }

    public static function getOrderBy(): string
    {
        return static::$orderBy;
    }

    public static function getOrderDirection(): string
    {
        return static::$orderDirection;
    }

    public static function getBrowsePerm(): null|string
    {
        return static::$browsePerm;
    }

    public static function getCreatePerm(): null|string
    {
        return static::$createPerm;
    }

    public static function getEditPerm(): null|string
    {
        return static::$editPerm;
    }

    public static function getDeletePerm(): null|string
    {
        return static::$deletePerm;
    }
}
