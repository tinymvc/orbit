<?php

namespace App\Services\Bread\Table;

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
    protected ?string $queryKey = null;
    protected bool $multiple = false;
    protected bool $exclude = false;

    public function queryKey(string $key): static { $this->queryKey = $key; return $this; }
    public function multiple(bool $enabled = true): static { $this->multiple = $enabled; return $this; }
    public function exclude(bool $enabled = true): static { $this->exclude = $enabled; return $this; }
    public function getQueryKey(): string { return $this->queryKey ?? $this->key; }
    public function isMultiple(): bool { return $this->multiple; }
    public function isExclude(): bool { return $this->exclude; }

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
            'queryKey' => $this->getQueryKey(),
            'multiple' => $this->multiple,
            'variant' => $this->exclude ? 'exclude' : 'filter',
            'label' => $this->label ?? str($this->key)->headline()->toString(),
            'options' => $this->options,
        ];
    }
}