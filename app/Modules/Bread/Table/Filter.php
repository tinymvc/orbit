<?php

namespace App\Modules\Bread\Table;

/**
 * Fluent filter builder for BREAD table resources.
 *
 * @example
 *   Filter::make('status')->label('Status')->options([...])
 *   Filter::make('user_id')->label('Author')->options('dynamic:authors')
 */
class Filter
{
    protected string $key;
    protected ?string $label = null;
    protected array|string $options = [];

    // ─── Constructor & Factory ──────────────────────────────────────────

    public function __construct(string $key)
    {
        $this->key = $key;
    }

    public static function make(string $key): static
    {
        return new static($key);
    }

    // ─── Setters ────────────────────────────────────────────────────────

    public function label(string $label): static
    {
        $this->label = $label;
        return $this;
    }

    /**
     * Set filter options.
     * Pass an array of ['value' => ..., 'label' => ...] or a 'dynamic:key' string.
     */
    public function options(array|string $options): static
    {
        $this->options = $options;
        return $this;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public function getKey(): string
    {
        return $this->key;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label ?? ucfirst(str_replace('_', ' ', $this->key)),
            'options' => $this->options,
        ];
    }
}