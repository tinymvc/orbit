<?php

namespace Tests\Unit;

use App\Services\Dashboard\Charts;
use App\Services\Dashboard\Dashboard;
use App\Services\Dashboard\Stats;
use Spark\Testing\TestCase;

final class DashboardTest extends TestCase
{
    public function test_all_chart_types_serialize_with_stats_and_date_ranges(): void
    {
        $charts = [];
        foreach ([Charts\AreaChart::class => 'area', Charts\BarChart::class => 'bar',
            Charts\LineChart::class => 'line', Charts\PieChart::class => 'pie',
            Charts\RadarChart::class => 'radar', Charts\RadialChart::class => 'radial'] as $class => $type) {
            $chart = $class::make('Revenue')->data([['month' => 'Jan', 'sales' => 10]])
                ->dataKeys(['sales'])->xAxisKey('month')->colors(['#123456'])->height(200)->colSpan(2);
            $this->assertSame($type, $chart->toArray()['type']);
            $charts[] = $chart;
        }
        $dashboard = Dashboard::make('Overview', 'Report')
            ->stats([Stats::make('Sales')->value('10')->change(-2.5)->trend('down')->footer('Last month')])
            ->charts($charts)->dateRange('/admin')->activeDateRange('2026-09-01', '2026-09-24')->toArray();
        $this->assertSame('Overview', $dashboard['title']);
        $this->assertSame(-2.5, $dashboard['stats'][0]['change']);
        $this->assertSame('down', $dashboard['stats'][0]['trend']);
        $this->assertSame([['month' => 'Jan', 'sales' => 10]], $dashboard['charts'][0]['data']);
        $this->assertSame('2026-09-01', $dashboard['dateRange']['from']);
        $this->assertCount(4, $dashboard['dateRange']['presets']);
        $this->assertFalse(array_key_exists('dateRange', Dashboard::make()->toArray()));
    }
}
