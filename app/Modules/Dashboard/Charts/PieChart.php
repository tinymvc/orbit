<?php

namespace App\Modules\Dashboard\Charts;

/**
 * Pie chart configuration.
 *
 * For pie charts, `dataKeys` should contain a single key for the value field,
 * and each data entry should have a `name` field for the label.
 *
 * Usage:
 *   PieChart::make('Browser Share')
 *       ->dataKeys(['value'])
 *       ->colors(['hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', ...])
 *       ->data([
 *           ['name' => 'Chrome', 'value' => 62],
 *           ['name' => 'Safari', 'value' => 19],
 *       ]);
 */
class PieChart extends Chart
{
    protected string $type = 'pie';
}
