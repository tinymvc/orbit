<?php

namespace App\Modules\Bread\Form;

/**
 * Rich text editor field (Tiptap on the frontend).
 *
 * @example
 *   RichEditor::make('content')->required()->rows(12)
 */
class RichEditor extends Field
{
    protected null|int $rows = null;

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return 'richtext';
    }

    // ─── Property Setters ───────────────────────────────────────────────

    public function rows(int $rows): static
    {
        $this->rows = $rows;
        return $this;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = parent::toArray();

        if ($this->rows !== null)
            $arr['rows'] = $this->rows;

        return $arr;
    }

    public function toValidationRule(null|int $recordId = null): null|string
    {
        $parts = [$this->required ? 'required' : 'nullable'];
        return implode('|', $parts);
    }
}
