<?php

namespace App\Modules\Bread\Form;

/**
 * Select / Multi-select drop-down field.
 *
 * @example
 *   Select::make('status')->options([['value' => 'draft', 'label' => 'Draft'], ...])->required()
 *   Select::make('tags')->multi()->options('dynamic:tags')
 */
class Select extends Field
{
    protected bool $isMulti = false;
    protected array|string|null $options = null;
    protected null|string $inValues = null;

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return $this->isMulti ? 'multi-select' : 'select';
    }

    // ─── Property Setters ───────────────────────────────────────────────

    /** Enable multi-select mode */
    public function multi(): static
    {
        $this->isMulti = true;
        return $this;
    }

    /**
     * Set options — static array or "dynamic:key" string.
     *
     * @param array|string $options
     */
    public function options(array|string $options): static
    {
        $this->options = $options;
        return $this;
    }

    /**
     * Comma-separated allowed values for validation.
     */
    public function in(string $values): static
    {
        $this->inValues = $values;
        return $this;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = parent::toArray();

        if ($this->options !== null)
            $arr['options'] = $this->options;
        if ($this->inValues !== null)
            $arr['in'] = $this->inValues;

        return $arr;
    }

    public function toValidationRule(null|int $recordId = null): null|string
    {
        $parts = [$this->required ? 'required' : 'nullable'];

        if ($this->inValues !== null) {
            $parts[] = 'in:' . $this->inValues;
        }

        return implode('|', $parts);
    }
}
