<?php

namespace App\Modules\Bread\Table;

use Spark\Contracts\Support\Arrayable;

/**
 * Fluent filter builder for BREAD table resources.
 *
 * @example
 *   Filter::make('status')->label('Status')->options([...])
 *   Filter::make('user_id')->label('Author')->options('dynamic:authors')
 */
class Filter implements Arrayable
{
    // ─── Constructor & Factory ──────────────────────────────────────────

    public function __construct(
        protected string $key,
        protected null|string $label = null,
        protected array|string $options = [],
        protected mixed $callback = null,
    ) {
    }

    public static function make(
        string $key,
        null|string $label = null,
        array|string $options = [],
    ): static {
        return new static($key, $label, $options);
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

    public function callback(null|array|string|callable $callback): static
    {
        $this->callback = $callback;
        return $this;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public function getKey(): string
    {
        return $this->key;
    }

    public function getCallback(): null|array|string|callable
    {
        return $this->callback;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label ?? str($this->key)->headline()->toString(),
            'options' => $this->options,
        ];
    }
}