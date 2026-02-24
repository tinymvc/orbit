<?php

namespace App\Modules\Bread\Form;

use Spark\Support\Str;

/**
 * Slug input field — auto-generated from another field.
 *
 * @example
 *   SlugInput::make('slug')->from('title')->unique('posts,slug')->maxLength(255)
 */
class SlugInput extends Field
{
    protected ?string $slugFrom = null;
    protected ?string $unique = null;
    protected ?int $maxLength = null;

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return 'slug';
    }

    // ─── Property Setters ───────────────────────────────────────────────

    /** Which field to generate the slug from */
    public function from(string $field): static
    {
        $this->slugFrom = $field;
        return $this;
    }

    public function unique(string $table, ?string $column = null): static
    {
        $this->unique = $column ? "$table,$column" : $table;
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

        if ($this->slugFrom !== null)
            $arr['slugFrom'] = $this->slugFrom;
        if ($this->unique !== null)
            $arr['unique'] = $this->unique;
        if ($this->maxLength !== null)
            $arr['maxLength'] = $this->maxLength;

        return $arr;
    }

    public function toValidationRule(?int $recordId = null): ?string
    {
        $parts = [$this->required ? 'required' : 'nullable'];

        if ($this->maxLength !== null)
            $parts[] = 'max:' . $this->maxLength;

        if ($this->unique !== null) {
            $rule = 'unique:' . $this->unique;
            if ($recordId)
                $rule .= ",$recordId";
            $parts[] = $rule;
        }

        return implode('|', $parts);
    }
}
