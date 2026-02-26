<?php

namespace App\Modules\Dashboard\Charts;

use Spark\Contracts\Support\Arrayable;

/**
 * Abstract base class for all dashboard chart types.
 *
 * Provides a fluent API to configure chart rendering.
 * Subclasses define the chart `type` (bar, line, area, pie).
 *
 * @author Shahin Moyshan <shahin.moyshan2@gmail.com>
 */
abstract class Chart implements Arrayable
{
    /** Chart type identifier sent to the frontend */
    protected string $type;

    protected string $title = '';
    protected string $description = '';
    protected array $data = [];
    protected array $dataKeys = [];
    protected array $colors = [];
    protected string $xAxisKey = '';
    protected int $colSpan = 1;
    protected int $height = 350;

    /**
     * Create a new chart instance.
     */
    public static function make(string $title = ''): static
    {
        $instance = new static();
        $instance->title = $title;
        return $instance;
    }

    /**
     * Set the chart title.
     */
    public function title(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    /**
     * Set the chart description / subtitle.
     */
    public function description(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    /**
     * Set the chart data array.
     *
     * @param array<int, array<string, mixed>> $data
     */
    public function data(array $data): static
    {
        $this->data = $data;
        return $this;
    }

    /**
     * Set the data keys used for rendering series.
     * Each key maps to a series/bar/slice in the chart.
     *
     * @param string[] $dataKeys
     */
    public function dataKeys(array $dataKeys): static
    {
        $this->dataKeys = $dataKeys;
        return $this;
    }

    /**
     * Set the colors for each data key.
     * Should be CSS color values (hex, hsl, etc.).
     *
     * @param string[] $colors
     */
    public function colors(array $colors): static
    {
        $this->colors = $colors;
        return $this;
    }

    /**
     * Set the x-axis data key (category axis label).
     */
    public function xAxisKey(string $key): static
    {
        $this->xAxisKey = $key;
        return $this;
    }

    /**
     * Set how many grid columns this chart spans (1-4).
     */
    public function colSpan(int $colSpan): static
    {
        $this->colSpan = $colSpan;
        return $this;
    }

    /**
     * Set the chart height in pixels.
     */
    public function height(int $height): static
    {
        $this->height = $height;
        return $this;
    }

    /**
     * Convert to array for JSON serialization.
     */
    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'data' => $this->data,
            'dataKeys' => $this->dataKeys,
            'colors' => $this->colors,
            'xAxisKey' => $this->xAxisKey,
            'colSpan' => $this->colSpan,
            'height' => $this->height,
        ];
    }
}
