<?php

namespace App\Modules\Bread\Form;

/**
 * Multi-line textarea field.
 *
 * @example
 *   Textarea::make('excerpt')->required()->maxLength(500)->rows(3)
 */
class Textarea extends Field
{
    protected null|int $rows = null;
    protected null|int $maxLength = null;

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return 'textarea';
    }

    // ─── Property Setters ───────────────────────────────────────────────

    public function rows(int $rows): static
    {
        $this->rows = $rows;
        return $this;
    }

    public function maxLength(int $maxLength): static
    {
        $this->maxLength = $maxLength;
        return $this;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = parent::toArray();

        if ($this->rows !== null)
            $arr['rows'] = $this->rows;
        if ($this->maxLength !== null)
            $arr['maxLength'] = $this->maxLength;

        return $arr;
    }

    public function toValidationRule(null|int $recordId = null): null|string
    {
        $parts = [$this->required ? 'required' : 'nullable'];

        if ($this->maxLength !== null)
            $parts[] = 'max:' . $this->maxLength;

        return implode('|', $parts);
    }
}
