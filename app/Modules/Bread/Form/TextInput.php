<?php

namespace App\Modules\Bread\Form;

/**
 * Text input field — handles text, email, password, number, url, tel.
 *
 * @example
 *   TextInput::make('title')->required()->maxLength(255)
 *   TextInput::make('email')->email()->required()
 *   TextInput::make('price')->numeric()->min(0)->step(0.01)
 *   TextInput::make('password')->password()
 */
class TextInput extends Field
{
    protected string $inputType = 'text';
    protected null|int $maxLength = null;
    protected null|float $min = null;
    protected null|float $max = null;
    protected null|float $step = null;
    protected null|string $unique = null;

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return $this->inputType;
    }

    // ─── Sub-type Setters ───────────────────────────────────────────────

    public function email(): static
    {
        $this->inputType = 'email';
        return $this;
    }
    public function password(): static
    {
        $this->inputType = 'password';
        return $this;
    }
    public function numeric(): static
    {
        $this->inputType = 'number';
        return $this;
    }
    public function url(): static
    {
        $this->inputType = 'url';
        return $this;
    }
    public function tel(): static
    {
        $this->inputType = 'tel';
        return $this;
    }

    // ─── Property Setters ───────────────────────────────────────────────

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

    public function unique(string $table, ?string $column = null): static
    {
        $this->unique = $column ? "$table,$column" : $table;
        return $this;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = parent::toArray();

        if ($this->maxLength !== null)
            $arr['maxLength'] = $this->maxLength;
        if ($this->min !== null)
            $arr['min'] = $this->min;
        if ($this->max !== null)
            $arr['max'] = $this->max;
        if ($this->step !== null)
            $arr['step'] = $this->step;
        if ($this->unique !== null)
            $arr['unique'] = $this->unique;

        return $arr;
    }

    public function toValidationRule(null|int $recordId = null): null|string
    {
        $parts = [$this->required ? 'required' : 'nullable'];

        match ($this->inputType) {
            'email' => $parts[] = 'email',
            'number' => $parts[] = 'numeric',
            'url' => $parts[] = 'url',
            default => null,
        };

        if ($this->inputType === 'number') {
            if ($this->min !== null)
                $parts[] = 'min:' . $this->min;
            if ($this->max !== null)
                $parts[] = 'max:' . $this->max;
        }

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
