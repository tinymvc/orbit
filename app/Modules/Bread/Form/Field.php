<?php

namespace App\Modules\Bread\Form;

/**
 * Abstract base field for BREAD resources.
 *
 * Inspired by Filament PHP — each field type is its own class with
 * only the methods that make sense for that type.
 *
 * Common properties shared by all field types live here.
 * Type-specific classes (TextInput, Select, FileUpload, etc.) extend this.
 */
abstract class Field
{
    protected string $name;
    protected ?string $label = null;
    protected ?string $placeholder = null;
    protected bool $required = false;
    protected ?string $description = null;
    protected mixed $defaultValue = null;
    protected bool $hasDefaultValue = false;
    protected ?int $colSpan = null;
    protected bool $disabled = false;
    protected bool $createOnly = false;
    protected bool $editOnly = false;
    protected ?string $group = null;
    protected bool $hidden = false;
    protected ?array $visibleWhen = null;

    // ─── Constructor ────────────────────────────────────────────────────

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    /**
     * The field type string sent to the frontend.
     */
    abstract public function getType(): string;

    // ─── Common Setters ─────────────────────────────────────────────────

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
     * @example ->visibleWhen(['status' => 'published'])
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

    // ─── Getters ────────────────────────────────────────────────────────

    public function getName(): string
    {
        return $this->name;
    }

    public function isRequired(): bool
    {
        return $this->required;
    }

    public function isFileUpload(): bool
    {
        return false;
    }

    // File upload stubs — overridden by FileUpload
    public function getUploadTo(): ?string
    {
        return null;
    }
    public function getAcceptedTypes(): array
    {
        return [];
    }
    public function getMaxFileSize(): ?int
    {
        return null;
    }
    public function getCompress(): ?int
    {
        return null;
    }
    public function getResize(): ?array
    {
        return null;
    }

    // ─── Base Serialisation ─────────────────────────────────────────────

    /**
     * Common array fields shared by all types.
     * Subclasses should call parent::toArray() and merge their own keys.
     */
    public function toArray(): array
    {
        $arr = [
            'name' => $this->name,
            'type' => $this->getType(),
        ];

        if ($this->label !== null)
            $arr['label'] = $this->label;
        if ($this->placeholder !== null)
            $arr['placeholder'] = $this->placeholder;
        if ($this->required)
            $arr['required'] = true;
        if ($this->description !== null)
            $arr['description'] = $this->description;
        if ($this->hasDefaultValue)
            $arr['defaultValue'] = $this->defaultValue;
        if ($this->colSpan !== null)
            $arr['colSpan'] = $this->colSpan;
        if ($this->disabled)
            $arr['disabled'] = true;
        if ($this->createOnly)
            $arr['createOnly'] = true;
        if ($this->editOnly)
            $arr['editOnly'] = true;
        if ($this->group !== null)
            $arr['group'] = $this->group;
        if ($this->hidden)
            $arr['hidden'] = true;
        if ($this->visibleWhen !== null)
            $arr['visibleWhen'] = $this->visibleWhen;

        return $arr;
    }

    /**
     * Build a validation rule string. Override in subclasses for type-specific rules.
     */
    public function toValidationRule(?int $recordId = null): ?string
    {
        $parts = [];
        $parts[] = $this->required ? 'required' : 'nullable';
        return implode('|', $parts);
    }
}