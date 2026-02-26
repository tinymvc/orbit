<?php

namespace App\Modules\Dashboard\Charts;

/**
 * Radar chart configuration.
 *
 * Best for comparing multiple dimensions/metrics at once.
 *
 * Usage:
 *   RadarChart::make('Skills Assessment')
 *       ->xAxisKey('skill')
 *       ->dataKeys(['current', 'target'])
 *       ->colors(['hsl(221, 83%, 53%)', 'hsl(0, 84%, 60%)'])
 *       ->data([
 *           ['skill' => 'Speed', 'current' => 80, 'target' => 90],
 *           ['skill' => 'Quality', 'current' => 95, 'target' => 85],
 *       ]);
 */
class RadarChart extends Chart
{
    protected string $type = 'radar';
}
