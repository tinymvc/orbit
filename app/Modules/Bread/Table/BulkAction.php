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
    // ─── Constructor & Factory ──────────────────────────────────────────

    public function __construct(
        protected string $action,
        protected null|string $label = null,
        protected string $variant = 'default',
        protected null|string $statusColumn = null,
    ) {
    }

    public static function make(
        string $action,
        null|string $label = null,
        string $variant = 'default',
        null|string $statusColumn = null,
    ): static {
        return new static($action, $label, $variant, $statusColumn);
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

    /**
     * The database column to update when this bulk action is triggered.
     * Defaults to 'status' if not set.
     */
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

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = [
            'action' => $this->action,
            'label' => $this->label ?? str($this->action)->headline()->toString(),
            'variant' => $this->variant,
        ];

        if ($this->statusColumn !== null) {
            $arr['statusColumn'] = $this->statusColumn;
        }

        return $arr;
    }
}
