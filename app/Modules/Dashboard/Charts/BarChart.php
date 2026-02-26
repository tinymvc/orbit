<?php

namespace App\Modules\Dashboard\Charts;

/**
 * Bar chart configuration.
 *
 * Usage:
 *   BarChart::make('Monthly Sales')
 *       ->xAxisKey('month')
 *       ->dataKeys(['revenue', 'expenses'])
 *       ->colors(['hsl(221, 83%, 53%)', 'hsl(0, 84%, 60%)'])
 *       ->data([...]);
 */
class BarChart extends Chart
{
    protected string $type = 'bar';
}
