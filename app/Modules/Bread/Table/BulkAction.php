<?php

namespace App\Modules\Bread\Table;

/**
 * Fluent bulk action builder for BREAD table resources.
 *
 * @example
 *   BulkAction::make('published')->label('Publish Selected')
 *   BulkAction::make('delete')->label('Delete Selected')->destructive()
 */
class BulkAction
{
    protected string $action;
    protected ?string $label = null;
    protected string $variant = 'default';
    protected ?string $statusColumn = null;

    // ─── Constructor & Factory ──────────────────────────────────────────

    public function __construct(string $action)
    {
        $this->action = $action;
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
            'label' => $this->label ?? ucfirst(str_replace('_', ' ', $this->action)),
            'variant' => $this->variant,
        ];

        if ($this->statusColumn !== null) {
            $arr['statusColumn'] = $this->statusColumn;
        }

        return $arr;
    }
}
