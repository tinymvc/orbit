<?php

namespace App\Modules\Bread\Form;

/**
 * Fluent field builder for BREAD resources.
 *
 * Inspired by Filament PHP — every property is set via method chaining.
 *
 * @example
 *   Field::make('title')->text()->required()->maxLength(255)->placeholder('Enter title')
 *   Field::make('status')->select()->options([...])
 *   Field::make('avatar')->fileUpload()->uploadTo('avatars')->acceptedTypes(['jpg','png'])->maxFileSize(4096)
 */
class Field
{
    protected string $name;
    protected ?string $label = null;
    protected string $type = 'text';
    protected ?string $placeholder = null;
    protected bool $required = false;
    protected ?string $description = null;
    protected ?int $maxLength = null;
    protected ?float $min = null;
    protected ?float $max = null;
    protected ?float $step = null;
    protected ?int $rows = null;
    protected array|string|null $options = null;
    protected mixed $defaultValue = null;
    protected bool $hasDefaultValue = false;
    protected ?int $colSpan = null;
    protected bool $disabled = false;
    protected ?string $slugFrom = null;
    protected bool $createOnly = false;
    protected bool $editOnly = false;
    protected bool $disablePast = false;
    protected bool $disableFuture = false;
    protected ?string $group = null;
    protected bool $hidden = false;
    protected ?array $visibleWhen = null;
    protected ?string $unique = null;
    protected ?string $in = null;

    // ─── File upload specific ───────────────────────────────────────────
    protected ?string $uploadTo = null;
    protected array $acceptedTypes = [];
    protected ?int $maxFileSize = null;   // KB
    protected ?int $compress = null;
    protected ?array $resize = null;
    protected ?string $mediaUrl = null;

    // ─── Constructor & Factory ──────────────────────────────────────────

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    /**
     * Create a new field instance.
     */
    public static function make(string $name): static
    {
        return new static($name);
    }

    // ─── Type Setters (fluent) ──────────────────────────────────────────

    public function text(): static
    {
        $this->type = 'text';
        return $this;
    }

    public function email(): static
    {
        $this->type = 'email';
        return $this;
    }

    public function password(): static
    {
        $this->type = 'password';
        return $this;
    }

    public function number(): static
    {
        $this->type = 'number';
        return $this;
    }

    public function url(): static
    {
        $this->type = 'url';
        return $this;
    }

    public function tel(): static
    {
        $this->type = 'tel';
        return $this;
    }

    public function textarea(): static
    {
        $this->type = 'textarea';
        return $this;
    }

    public function richText(): static
    {
        $this->type = 'richtext';
        return $this;
    }

    public function select(): static
    {
        $this->type = 'select';
        return $this;
    }

    public function multiSelect(): static
    {
        $this->type = 'multi-select';
        return $this;
    }

    public function checkbox(): static
    {
        $this->type = 'checkbox';
        return $this;
    }

    public function toggle(): static
    {
        $this->type = 'switch';
        return $this;
    }

    public function date(): static
    {
        $this->type = 'date';
        return $this;
    }

    public function dateTime(): static
    {
        $this->type = 'datetime';
        return $this;
    }

    public function slug(): static
    {
        $this->type = 'slug';
        return $this;
    }

    public function hiddenField(): static
    {
        $this->type = 'hidden';
        return $this;
    }

    /**
     * File upload field — files are uploaded via the backend `uploader()` helper.
     */
    public function fileUpload(): static
    {
        $this->type = 'file';
        return $this;
    }

    // ─── Common Property Setters ────────────────────────────────────────

    public function label(string $label): static
    {
        $this->label = $label;
        return $this;
    }

    public function placeholder(string $placeholder): static
    {
        $this->placeholder = $placeholder;
        return $this;
    }

    public function required(bool $required = true): static
    {
        $this->required = $required;
        return $this;
    }

    public function description(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function maxLength(int $maxLength): static
    {
        $this->maxLength = $maxLength;
        return $this;
    }

    public function min(float $min): static
    {
        $this->min = $min;
        return $this;
    }

    public function max(float $max): static
    {
        $this->max = $max;
        return $this;
    }

    public function step(float $step): static
    {
        $this->step = $step;
        return $this;
    }

    public function rows(int $rows): static
    {
        $this->rows = $rows;
        return $this;
    }

    /**
     * Set options for select / multi-select.
     * Pass an array of ['value' => ..., 'label' => ...] or a 'dynamic:key' string.
     */
    public function options(array|string $options): static
    {
        $this->options = $options;
        return $this;
    }

    public function default(mixed $value): static
    {
        $this->defaultValue = $value;
        $this->hasDefaultValue = true;
        return $this;
    }

    public function columnSpan(int $span): static
    {
        $this->colSpan = $span;
        return $this;
    }

    /** Alias for columnSpan(2) */
    public function fullWidth(): static
    {
        $this->colSpan = 2;
        return $this;
    }

    public function disabled(bool $disabled = true): static
    {
        $this->disabled = $disabled;
        return $this;
    }

    /**
     * Auto-generate a slug from another field (e.g. "title").
     */
    public function from(string $sourceField): static
    {
        $this->slugFrom = $sourceField;
        return $this;
    }

    public function createOnly(bool $createOnly = true): static
    {
        $this->createOnly = $createOnly;
        return $this;
    }

    public function editOnly(bool $editOnly = true): static
    {
        $this->editOnly = $editOnly;
        return $this;
    }

    public function disablePastDates(bool $disable = true): static
    {
        $this->disablePast = $disable;
        return $this;
    }

    public function disableFutureDates(bool $disable = true): static
    {
        $this->disableFuture = $disable;
        return $this;
    }

    public function group(string $group): static
    {
        $this->group = $group;
        return $this;
    }

    public function isHidden(bool $hidden = true): static
    {
        $this->hidden = $hidden;
        return $this;
    }

    /**
     * Show this field only when another field matches a value.
     *
     * @example ->visibleWhen('status', 'published')
     * @example ->visibleWhen(['status' => 'published', 'featured' => true])
     */
    public function visibleWhen(string|array $field, mixed $value = null): static
    {
        if (is_array($field)) {
            $this->visibleWhen = $field;
        } else {
            $this->visibleWhen ??= [];
            $this->visibleWhen[$field] = $value;
        }
        return $this;
    }

    /**
     * Unique validation rule. Accepts "table,column" string or separate args.
     */
    public function unique(string $table, ?string $column = null): static
    {
        $this->unique = $column ? "$table,$column" : $table;
        return $this;
    }

    /**
     * In-list validation constraint.
     */
    public function in(string|array $values): static
    {
        $this->in = is_array($values) ? implode(',', $values) : $values;
        return $this;
    }

    // ─── File Upload Specific ───────────────────────────────────────────

    /**
     * Set the upload subdirectory (under storage/uploads/).
     */
    public function uploadTo(string $directory): static
    {
        $this->uploadTo = $directory;
        return $this;
    }

    /**
     * Accepted file extensions.
     *
     * @example ->acceptedTypes(['jpg', 'jpeg', 'png', 'webp'])
     */
    public function acceptedTypes(array $extensions): static
    {
        $this->acceptedTypes = $extensions;
        return $this;
    }

    /**
     * Max file size in KB.
     */
    public function maxFileSize(int $sizeKB): static
    {
        $this->maxFileSize = $sizeKB;
        return $this;
    }

    /**
     * Compress uploaded images (quality 1-100).
     */
    public function compress(int $quality): static
    {
        $this->compress = $quality;
        return $this;
    }

    /**
     * Resize uploaded images to [width, height].
     */
    public function resize(int $width, int $height): static
    {
        $this->resize = [$width, $height];
        return $this;
    }

    /**
     * Media URL prefix for displaying uploaded files.
     * Defaults to config('media_url').
     */
    public function mediaUrl(string $url): static
    {
        $this->mediaUrl = $url;
        return $this;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public function getName(): string
    {
        return $this->name;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function isRequired(): bool
    {
        return $this->required;
    }

    public function isFileUpload(): bool
    {
        return $this->type === 'file';
    }

    public function getUploadTo(): ?string
    {
        return $this->uploadTo;
    }

    public function getAcceptedTypes(): array
    {
        return $this->acceptedTypes;
    }

    public function getMaxFileSize(): ?int
    {
        return $this->maxFileSize;
    }

    public function getCompress(): ?int
    {
        return $this->compress;
    }

    public function getResize(): ?array
    {
        return $this->resize;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    /**
     * Convert to the array format expected by the frontend.
     */
    public function toArray(): array
    {
        $arr = [
            'name' => $this->name,
            'type' => $this->type,
        ];

        // Only include non-null / non-default values to keep payload lean
        if ($this->label !== null)
            $arr['label'] = $this->label;
        if ($this->placeholder !== null)
            $arr['placeholder'] = $this->placeholder;
        if ($this->required)
            $arr['required'] = true;
        if ($this->description !== null)
            $arr['description'] = $this->description;
        if ($this->maxLength !== null)
            $arr['maxLength'] = $this->maxLength;
        if ($this->min !== null)
            $arr['min'] = $this->min;
        if ($this->max !== null)
            $arr['max'] = $this->max;
        if ($this->step !== null)
            $arr['step'] = $this->step;
        if ($this->rows !== null)
            $arr['rows'] = $this->rows;
        if ($this->options !== null)
            $arr['options'] = $this->options;
        if ($this->hasDefaultValue)
            $arr['defaultValue'] = $this->defaultValue;
        if ($this->colSpan !== null)
            $arr['colSpan'] = $this->colSpan;
        if ($this->disabled)
            $arr['disabled'] = true;
        if ($this->slugFrom !== null)
            $arr['slugFrom'] = $this->slugFrom;
        if ($this->createOnly)
            $arr['createOnly'] = true;
        if ($this->editOnly)
            $arr['editOnly'] = true;
        if ($this->disablePast)
            $arr['disablePast'] = true;
        if ($this->disableFuture)
            $arr['disableFuture'] = true;
        if ($this->group !== null)
            $arr['group'] = $this->group;
        if ($this->hidden)
            $arr['hidden'] = true;
        if ($this->visibleWhen !== null)
            $arr['visibleWhen'] = $this->visibleWhen;
        if ($this->unique !== null)
            $arr['unique'] = $this->unique;
        if ($this->in !== null)
            $arr['in'] = $this->in;

        // File upload metadata sent to frontend
        if ($this->type === 'file') {
            if ($this->uploadTo !== null)
                $arr['uploadTo'] = $this->uploadTo;
            if (!empty($this->acceptedTypes))
                $arr['acceptedTypes'] = $this->acceptedTypes;
            if ($this->maxFileSize !== null)
                $arr['maxFileSize'] = $this->maxFileSize;
            $arr['mediaUrl'] = $this->mediaUrl ?? config('media_url', '/uploads/');
        }

        return $arr;
    }

    /**
     * Build a validation rule string from this field's configuration.
     */
    public function toValidationRule(?int $recordId = null): ?string
    {
        if (in_array($this->type, ['hidden', 'custom'])) {
            return null;
        }

        $parts = [];
        $parts[] = $this->required ? 'required' : 'nullable';

        switch ($this->type) {
            case 'email':
                $parts[] = 'email';
                break;
            case 'number':
                $parts[] = 'numeric';
                if ($this->min !== null)
                    $parts[] = 'min:' . $this->min;
                if ($this->max !== null)
                    $parts[] = 'max:' . $this->max;
                break;
            case 'url':
                $parts[] = 'url';
                break;
            case 'multi-select':
                $parts[] = 'array';
                break;
            case 'file':
                // After upload processing the value is a path string
                $parts[] = 'string';
                break;
        }

        if ($this->maxLength !== null) {
            $parts[] = 'max:' . $this->maxLength;
        }

        if ($this->unique !== null) {
            $uniqueRule = 'unique:' . $this->unique;
            if ($recordId) {
                $uniqueRule .= ",$recordId";
            }
            $parts[] = $uniqueRule;
        }

        if ($this->in !== null) {
            $parts[] = 'in:' . $this->in;
        }

        return implode('|', $parts);
    }
}