<?php

namespace App\Services\Bread;

use App\Services\Bread\Form\Combobox;
use App\Services\Bread\Form\Field;
use App\Services\Bread\Table\BulkAction;
use App\Services\Bread\Table\Column;
use App\Services\Bread\Table\Filter;
use Spark\Contracts\Support\Arrayable;
use Spark\Database\Model;
use Spark\Database\QueryBuilder;
use Spark\Foundation\Application;
use Spark\Http\Request;
use Spark\Facades\Storage;
use function count;
use function in_array;
use function is_array;

/**
 * Abstract base for all BREAD resources.
 * 
 * This class defines the core structure and functionality for BREAD resources.
 * Each resource represents a CRUD interface for a specific TinyMVC model.
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

    /** @param class-string<Model> $model TinyMVC model class */
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
    /** Null inherits delete permission; override for separate trash permissions. */
    protected static null|string $restorePerm = null;
    protected static null|string $forceDeletePerm = null;

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

    /** Override to configure the reference BREAD editor and table features. */
    public static function editor(): array
    {
        return ['style' => 'drawer', 'width' => static::$drawerWidth];
    }
    public static function pageSizeOptions(): array
    {
        return [10, 20, 30, 40, 50, 100, 200, 500];
    }
    public static function tableStateStorageKey(): ?string
    {
        return null;
    }
    /** Explicit allowlist of scalar database fields: key, label, type, optional options. */
    public static function advancedFilterFields(): array
    {
        return [];
    }
    public static function sortableColumns(): array
    {
        return array_values(array_map(
            fn($column) => $column->getKey(),
            array_filter(static::columns(), fn($column) => $column instanceof Column && $column->isSortable())
        ));
    }

    /** Soft deletes are enabled by the model, including custom deletion columns. */
    public static function usesSoftDeletes(): bool
    {
        return (new (static::getModel()))->usesSoftDeletes();
    }

    public static function getRestorePerm(): ?string
    {
        return static::$restorePerm ?? static::$deletePerm;
    }
    public static function getForceDeletePerm(): ?string
    {
        return static::$forceDeletePerm ?? static::$deletePerm;
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
            $key = $filter instanceof Filter ? $filter->getKey() : ($filter['key'] ?? '');
            $queryKey = $filter instanceof Filter ? $filter->getQueryKey() : ($filter['queryKey'] ?? $key);
            if (!$request->has($queryKey))
                continue;
            $value = $request->input($queryKey);
            if ($value === '' || $value === null || $value === [])
                continue;
            $multiple = $filter instanceof Filter ? $filter->isMultiple() : ($filter['multiple'] ?? false);
            $exclude = $filter instanceof Filter ? $filter->isExclude() : (($filter['variant'] ?? '') === 'exclude');
            if ($multiple)
                $value = is_array($value) ? $value : explode(',', (string) $value);
            if ((!$multiple && !is_scalar($value)) || ($multiple && (count($value) > 100 || count(array_filter($value, 'is_scalar')) !== count($value)))) {
                throw new \InvalidArgumentException('Invalid filter value.');
            }
            if ($filter instanceof Filter && ($callback = $filter->getCallback()) !== null) {
                Application::$app->call($callback, ['query' => $query, 'value' => $value]);
            } elseif ($multiple) {
                $exclude ? $query->whereNotIn($key, $value) : $query->whereIn($key, $value);
            } else {
                $query->where($key, $exclude ? '!=' : '=', $value);
            }
        }
        $advanced = $request->input('af', $request->input('advanced_filter'));
        if ($advanced !== null && $advanced !== '') {
            AdvancedFilters::apply($query, $advanced, static::advancedFilterFields());
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

    /** Trash lifecycle hooks apply to individual and bulk actions alike. */
    public static function beforeRestore($record): void
    {
    }
    public static function afterRestore($record): void
    {
    }
    public static function beforeForceDelete($record): void
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
     * Call after validating other input. Old files are removed only after saving.
     */
    public static function processFileUploads(Request $request, null|Model $existingRecord = null): array
    {
        $uploadedFiles = [];

        try {
            foreach (static::getFileFields() as $field) {
                $name = $field->getName();
                $payload = $request->file($name);
                $hasUpload = is_array($payload) && ($payload['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_NO_FILE;
                if (!$request->has($name) && !$hasUpload)
                    continue;

                $old = static::filePaths($field, $existingRecord?->{$name});
                if ($field->isMultiple()) {
                    $input = $request->input($name, []);
                    $kept = is_array($input) ? array_filter($input, 'is_string') : [];
                    $uploadedFiles[$name] = array_values(array_intersect($kept, $old));
                } elseif (!$hasUpload) {
                    if ($existingRecord && in_array($request->input($name), ['', null], true)) {
                        $uploadedFiles[$name] = null;
                    }
                    continue;
                }
                if (!$hasUpload)
                    continue;

                $uploader = Storage::disk($field->getDisk())->uploader(
                    uploadTo: $field->getUploadTo() ?? '',
                    extensions: $field->getAcceptedTypes(),
                    multiple: false,
                    maxSize: $field->getMaxFileSize(),
                    compress: $field->getCompress(),
                    resize: $field->getResize(),
                );

                // Upload one file at a time so a later failure can roll back every new key.
                $files = [$payload];
                if ($field->isMultiple()) {
                    if (!is_array($payload['name'] ?? null)) {
                        throw new \Spark\Exceptions\Utils\UploaderUtilException('Invalid multiple upload payload.');
                    }
                    $files = [];
                    foreach ($payload['name'] as $key => $filename) {
                        $file = ['name' => $filename];
                        foreach (['tmp_name', 'size', 'error', 'type'] as $attribute) {
                            $file[$attribute] = $payload[$attribute][$key] ?? null;
                        }
                        if ($file['error'] !== UPLOAD_ERR_NO_FILE)
                            $files[] = $file;
                    }
                }
                foreach ($files as $file) {
                    $path = $uploader->upload($file);
                    if ($field->isMultiple()) {
                        $uploadedFiles[$name] = [...$uploadedFiles[$name], ...(array) $path];
                    } else {
                        $uploadedFiles[$name] = $path;
                    }
                }
            }
            foreach (static::getFileFields() as $field) {
                $name = $field->getName();
                $value = array_key_exists($name, $uploadedFiles) ? $uploadedFiles[$name] : $existingRecord?->{$name};
                if ($field->isRequired() && !static::filePaths($field, $value)) {
                    throw new \Spark\Exceptions\Utils\UploaderUtilException('This file field is required.');
                }
            }
        } catch (\Throwable $error) {
            static::cleanUpFileChanges($uploadedFiles, $existingRecord, saved: false);
            throw new UploadException($name, $error);
        }

        return $uploadedFiles;
    }

    /** Remove replaced files after saving, or new files after a failed save. */
    public static function cleanUpFileChanges(array $changes, ?Model $original = null, bool $saved = true): void
    {
        foreach (static::getFileFields() as $field) {
            $name = $field->getName();
            if (!array_key_exists($name, $changes)) {
                continue;
            }
            $old = $original?->{$name};
            if ($field->isMultiple() && is_string($old)) {
                $old = json_decode($old, true) ?: [];
            }
            $old = array_filter((array) $old, 'is_string');
            $new = array_filter((array) $changes[$name], 'is_string');
            $removed = $saved ? array_diff($old, $new) : array_diff($new, $old);
            foreach ($removed as $path) {
                // Seeded/external media URLs are not files owned by this application.
                if (preg_match('#^https?://#i', $path)) {
                    continue;
                }
                Storage::disk($field->getDisk())->delete($path);
            }
        }
    }

    public static function filePaths(Form\FileUpload $field, mixed $value): array
    {
        if ($field->isMultiple() && is_string($value))
            $value = json_decode($value, true) ?: [];
        return array_values(array_filter((array) $value, fn($path) => is_string($path) && $path !== ''));
    }

    /** Keep stored keys intact; preview URLs are separate, read-only metadata. */
    public static function recordWithFileUrls(Model|array $record): array
    {
        $data = $record instanceof Model ? $record->toArray() : $record;
        $data['__fileUrls'] = [];
        foreach (static::getFileFields() as $field) {
            foreach (static::filePaths($field, $data[$field->getName()] ?? null) as $path) {
                if (preg_match('#^https?://#i', $path)) {
                    $url = $path;
                } elseif ($field->getMediaUrl() !== null) {
                    $url = rtrim($field->getMediaUrl(), '/') . '/' . implode('/', array_map('rawurlencode', explode('/', $path)));
                } elseif (config('storage.disks.' . ($field->getDisk() ?? config('storage.default')) . '.visibility') === 'public') {
                    $url = Storage::disk($field->getDisk())->url($path);
                } else {
                    $url = static::getUrl() . '/' . $data['id'] . '/file?' . http_build_query([
                        'field' => $field->getName(),
                        'path' => $path,
                    ]);
                }
                $data['__fileUrls'][$field->getName()][$path] = $url;
            }
        }
        return $data;
    }

    /**
     * Delete all uploaded files for a record.
     */
    public static function deleteRecordFiles(Model $record): void
    {
        $changes = [];
        foreach (static::getFileFields() as $field) {
            $changes[$field->getName()] = null;
        }
        static::cleanUpFileChanges($changes, $record);
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

            if (!array_key_exists($name, $data)) {
                continue;
            }
            $ids = $data[$name];
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
        $bulkActions = static::serialise(static::bulkActions());
        if (static::usesSoftDeletes()) {
            $bulkActions = array_values(array_filter(
                $bulkActions,
                fn($action) => !in_array($action['action'], ['delete', 'restore', 'force-delete'], true)
            ));
            $bulkActions = [
                ...$bulkActions,
                ['action' => 'delete', 'label' => 'Move to trash', 'variant' => 'destructive'],
                ['action' => 'restore', 'label' => 'Restore', 'variant' => 'default'],
                ['action' => 'force-delete', 'label' => 'Delete permanently', 'variant' => 'destructive'],
            ];
        }
        return [
            'name' => static::$name,
            'title' => static::getTitle(),
            'description' => static::$description,
            'url' => static::getUrl(),

            'fields' => static::serialise(static::fields()),
            'columns' => static::serialise(static::columns()),
            'filters' => static::serialise(static::filters()),
            'bulkActions' => $bulkActions,
            'softDeletes' => static::usesSoftDeletes() ? ['column' => (new (static::getModel()))->getSoftDeleteColumn()] : null,

            'permissions' => [
                'browse' => static::$browsePerm,
                'create' => static::$createPerm,
                'edit' => static::$editPerm,
                'delete' => static::$deletePerm,
                'restore' => static::getRestorePerm(),
                'forceDelete' => static::getForceDeletePerm(),
            ],

            'drawerWidth' => static::$drawerWidth,
            'editor' => static::editor(),
            'pageSizeOptions' => static::pageSizeOptions(),
            'serverSorting' => !empty(static::sortableColumns()),
            'tableStateStorageKey' => static::tableStateStorageKey(),
            'advancedFilters' => static::advancedFilterFields() ? ['fields' => static::advancedFilterFields()] : null,
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
        return static::$title ?? (string) str(static::$name)->plural();
    }

    public static function getUrl(): string
    {
        return static::$urlPrefix . static::$slug;
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
