<?php

namespace App\Modules\Bread\Form;

/**
 * Hidden field — not rendered in UI, but included in form data.
 *
 * @example
 *   Hidden::make('user_id')->default(auth()->id())
 */
class Hidden extends Field
{
    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return 'hidden';
    }
}
