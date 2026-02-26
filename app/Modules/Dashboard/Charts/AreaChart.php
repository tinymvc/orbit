<?php

namespace App\Modules\Dashboard\Charts;

/**
 * Area chart configuration.
 *
 * Usage:
 *   AreaChart::make('Traffic Overview')
 *       ->xAxisKey('month')
 *       ->dataKeys(['visitors', 'pageViews'])
 *       ->colors(['hsl(173, 58%, 39%)', 'hsl(197, 37%, 24%)'])
 *       ->data([...]);
 */
class AreaChart extends Chart
{
    protected string $type = 'area';
}
