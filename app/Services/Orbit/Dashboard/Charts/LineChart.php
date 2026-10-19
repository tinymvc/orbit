<?php

namespace App\Services\Orbit\Dashboard\Charts;

/**
 * Line chart configuration.
 *
 * Usage:
 *   LineChart::make('User Growth')
 *       ->xAxisKey('month')
 *       ->dataKeys(['users'])
 *       ->colors(['hsl(262, 83%, 58%)'])
 *       ->data([...]);
 */
class LineChart extends Chart
{
    protected string $type = 'line';
}
