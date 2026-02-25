<?php

namespace App\Modules\Bread\Table;

use Spark\Contracts\Support\Arrayable;

/**
 * Fluent bulk action builder for BREAD table resources.
 *
 * @example
 *   BulkAction::make('published')->label('Publish Selected')
 *   BulkAction::make('delete')->label('Delete Selected')->destructive()
 */
class BulkAction implements Arrayable
{
    protected null|string $label = null;
    protected string $variant = 'default';
    protected null|string $statusColumn = null;
    protected mixed $callback = null;

    // ─── Constructor & Factory ──────────────────────────────────────────

    public function __construct(protected string $action)
    {
    }

    public static function make(string $action): static
    {
        return new static($action);
    }

    // ─── Setters ────────────────────────────────────────────────────────

    public function label(string $label): static
    {
        $this->label = $label;
        return $this;
    }

    public function destructive(): static
    {
        $this->variant = 'destructive';
        return $this;
    }

    public function variant(string $variant): static
    {
        $this->variant = $variant;
        return $this;
    }

    public function callback(null|array|string|callable $callback): static
    {
        $this->callback = $callback;
        return $this;
    }

    public function statusColumn(string $column): static
    {
        $this->statusColumn = $column;
        return $this;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public function getAction(): string
    {
        return $this->action;
    }

    public function getCallback(): null|array|string|callable
    {
        return $this->callback;
    }

    public function getStatusColumn(): null|string
    {
        return $this->statusColumn;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = [
            'action' => $this->action,
            'label' => $this->label ?? str($this->action)->headline()->toString(),
            'variant' => $this->variant,
        ];

        return $arr;
    }
}
