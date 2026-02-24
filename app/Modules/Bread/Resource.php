<?php

namespace App\Modules\Bread;

use App\Modules\Bread\Form\Field;
use App\Modules\Bread\Table\BulkAction;
use App\Modules\Bread\Table\Column;
use App\Modules\Bread\Table\Filter;
use Spark\Database\Model;
use Spark\Http\Request;
use Spark\Support\Str;
use function count;

/**
 * Abstract base for all BREAD resources.
 *
 * Inspired by Filament PHP — define your model, fields, columns, filters,
 * permissions, and bulk-actions in one class using fluent builder objects.
 * The generic ResourceController handles all CRUD automatically and sends
 * the schema to the frontend where `bread.tsx` renders it.
 *
 * Usage:
 *   class PostsResource extends Resource {
 *       protected static string $model = \App\Models\Post::class;
 *       public static function fields(): array {
 *           return [
 *               Field::make('title')->text()->required()->maxLength(255),
 *           ];
 *       }
 *       ...
 *   }
 */
abstract class Resource
{
    // ─── Core ───────────────────────────────────────────────────────────

    /** Eloquent model class */
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

    // ─── Extra data & hooks ─────────────────────────────────────────────

    /**
     * Extra data (props) to pass alongside the resource schema.
     * e.g. author list, categories, etc.
     */
    public static function extraProps(): array
    {
        return [];
    }

    /**
     * Validation rules for store (create).
     * Return null to auto-generate from fields.
     */
    public static function storeRules(): ?array
    {
        return null;
    }

    /**
     * Validation rules for update.
     * Return null to auto-generate from fields.
     */
    public static function updateRules(int $id): ?array
    {
        return null;
    }

    /**
     * Apply filters to the query based on request parameters.
     * Default implementation uses the filter key as a column name with WHERE =.
     */
    public static function applyFilters($query, $request)
    {
        foreach (static::filters() as $filter) {
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
    public static function applySearch($query, string $search)
    {
        if (empty(static::$searchable)) {
            return $query;
        }

        $cols = static::$searchable;

        if (count($cols) === 1) {
            return $query->like($cols[0], '%' . $search . '%');
        }

        $concatExpr = 'CONCAT(' . implode(', " ", ', $cols) . ')';
        $conditions = implode(' OR ', array_map(fn($c) => "$c LIKE :search", $cols));
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
        return array_filter(static::fields(), fn(Field $f) => $f->isFileUpload());
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
                uploader(uploadTo: $field->getUploadTo())
                    ->delete($record->{$name});
            }
        }
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
            fn($item) => $item instanceof Field || $item instanceof Column || $item instanceof Filter || $item instanceof BulkAction
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
            'title' => static::$title ?? Str::plural(static::$name),
            'description' => static::$description,
            'url' => static::$urlPrefix . static::$slug,

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
    public static function getBrowsePerm(): ?string
    {
        return static::$browsePerm;
    }
    public static function getCreatePerm(): ?string
    {
        return static::$createPerm;
    }
    public static function getEditPerm(): ?string
    {
        return static::$editPerm;
    }
    public static function getDeletePerm(): ?string
    {
        return static::$deletePerm;
    }
}
