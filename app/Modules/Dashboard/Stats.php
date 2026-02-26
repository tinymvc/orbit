<?php

namespace App\Modules\Dashboard;

use Spark\Contracts\Support\Arrayable;

/**
 * Fluent builder for a dashboard stat card.
 *
 * Usage:
 *   Stats::make('Total Revenue')
 *       ->value('$1,250.00')
 *       ->change(12.5)
 *       ->trend('up')
 *       ->description('Visitors for the last 6 months')
 *       ->footer('Trending up this month');
 *
 * @author Shahin Moyshan <shahin.moyshan2@gmail.com>
 */
class Stats implements Arrayable
{
    protected string $label;
    protected string $value = '0';
    protected float $change = 0;
    protected string $trend = 'up'; // 'up' | 'down' | 'neutral'
    protected string $footer = '';
    protected string $description = '';

    public function __construct(string $label)
    {
        $this->label = $label;
    }

    /**
     * Create a new stat card instance.
     */
    public static function make(string $label): static
    {
        return new static($label);
    }

    /**
     * Set the display value (formatted string).
     */
    public function value(string $value): static
    {
        $this->value = $value;
        return $this;
    }

    /**
     * Set the percentage change (positive or negative).
     */
    public function change(float $change): static
    {
        $this->change = $change;
        return $this;
    }

    /**
     * Set the trend direction: up, down, or neutral.
     */
    public function trend(string $trend): static
    {
        $this->trend = $trend;
        return $this;
    }

    /**
     * Set the footer text (e.g. "Trending up this month").
     */
    public function footer(string $footer): static
    {
        $this->footer = $footer;
        return $this;
    }

    /**
     * Set the description text (e.g. "Visitors for the last 6 months").
     */
    public function description(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    /**
     * Convert to array for JSON serialization.
     */
    public function toArray(): array
    {
        return [
            'label' => $this->label,
            'value' => $this->value,
            'change' => $this->change,
            'trend' => $this->trend,
            'footer' => $this->footer,
            'description' => $this->description,
        ];
    }
}
