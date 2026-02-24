<?php

namespace App\Modules\Bread\Form;

/**
 * Toggle / switch field (renders as Switch UI).
 *
 * @example
 *   Toggle::make('is_active')->label('Active')->default(true)
 */
class Toggle extends Field
{
    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return 'switch';
    }

    public function toValidationRule(?int $recordId = null): ?string
    {
        return 'boolean';
    }
}
