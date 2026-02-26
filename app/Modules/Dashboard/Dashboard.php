<?php

namespace App\Modules\Dashboard;

use App\Modules\Dashboard\Charts\Chart;
use Spark\Contracts\Support\Arrayable;

/**
 * Dynamic Dashboard builder.
 *
 * Collects Stats cards and Chart panels, then serializes them
 * into an array suitable for the Inertia frontend.
 *
 * Usage in a controller:
 *   $dashboard = Dashboard::make()
 *       ->stats([
 *           Stats::make('Revenue')->value('$1,250')->change(12.5)->trend('up'),
 *       ])
 *       ->charts([
 *           BarChart::make('Sales')->data([...])->dataKeys(['revenue']),
 *       ]);
 *
 *   return inertia('admin/dashboard', ['dashboard' => $dashboard->toArray()]);
 *
 * @author Shahin Moyshan <shahin.moyshan2@gmail.com>
 */
class Dashboard implements Arrayable
{
    protected string $title = 'Dashboard';
    protected string $description = '';

    /** @var Stats[] */
    protected array $stats = [];

    /** @var Chart[] */
    protected array $charts = [];

    /** Date range configuration */
    protected bool $dateRangeEnabled = false;
    protected string $dateRangeRoute = '';
    protected ?string $dateFrom = null;
    protected ?string $dateTo = null;

    /**
     * Date range presets (displayed as quick-select buttons).
     * Each entry: ['label' => '7D', 'days' => 7]
     * @var array<int, array{label: string, days: int}>
     */
    protected array $datePresets = [];

    /**
     * Create a new dashboard instance.
     */
    public static function make(string $title = 'Dashboard', string $description = ''): static
    {
        $instance = new static();
        $instance->title = $title;
        $instance->description = $description;
        return $instance;
    }

    /**
     * Set the page title.
     */
    public function title(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    /**
     * Set the page description / subtitle.
     */
    public function description(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    /**
     * Set the stat cards.
     *
     * @param Stats[] $stats
     */
    public function stats(array $stats): static
    {
        $this->stats = $stats;
        return $this;
    }

    /**
     * Set the chart panels.
     *
     * @param Chart[] $charts
     */
    public function charts(array $charts): static
    {
        $this->charts = $charts;
        return $this;
    }

    // ─── Date Range ─────────────────────────────────────────────────────

    /**
     * Enable the date range picker on this dashboard.
     *
     * @param string $route  The route to reload the page with query params (e.g. '/admin')
     * @param array  $presets  Quick-select presets: [['label' => '7D', 'days' => 7], ...]
     */
    public function dateRange(string $route, array $presets = []): static
    {
        $this->dateRangeEnabled = true;
        $this->dateRangeRoute = $route;

        $this->datePresets = !empty($presets)
            ? $presets
            : [
                ['label' => '7D', 'days' => 7],
                ['label' => '14D', 'days' => 14],
                ['label' => '30D', 'days' => 30],
                ['label' => '90D', 'days' => 90],
            ];

        return $this;
    }

    /**
     * Set the currently active date range (from the request).
     */
    public function activeDateRange(?string $from, ?string $to): static
    {
        $this->dateFrom = $from;
        $this->dateTo = $to;
        return $this;
    }

    /**
     * Convert the entire dashboard to an array for Inertia props.
     */
    public function toArray(): array
    {
        $data = [
            'title' => $this->title,
            'description' => $this->description,
            'stats' => array_map(fn(Stats $s) => $s->toArray(), $this->stats),
            'charts' => array_map(fn(Chart $c) => $c->toArray(), $this->charts),
        ];

        if ($this->dateRangeEnabled) {
            $data['dateRange'] = [
                'route' => $this->dateRangeRoute,
                'from' => $this->dateFrom,
                'to' => $this->dateTo,
                'presets' => $this->datePresets,
            ];
        }

        return $data;
    }
}
