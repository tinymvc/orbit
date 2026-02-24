<?php

namespace App\Modules\Bread\Form;

/**
 * Checkbox field (true/false).
 *
 * @example
 *   Checkbox::make('is_featured')
 */
class Checkbox extends Field
{
    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return 'checkbox';
    }

    public function toValidationRule(?int $recordId = null): ?string
    {
        return 'boolean';
    }
}
