<?php

namespace App\Modules\Dashboard\Charts;

/**
 * Radial bar (gauge) chart configuration.
 *
 * Great for showing progress or KPI completion.
 *
 * Usage:
 *   RadialChart::make('Goal Completion')
 *       ->dataKeys(['value'])
 *       ->colors(['hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)'])
 *       ->data([
 *           ['name' => 'Sales', 'value' => 78],
 *           ['name' => 'Support', 'value' => 92],
 *       ]);
 */
class RadialChart extends Chart
{
    protected string $type = 'radial';
}
