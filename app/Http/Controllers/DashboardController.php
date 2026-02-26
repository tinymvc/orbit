<?php

namespace App\Http\Controllers;

use App\Modules\Dashboard\Dashboard;
use App\Modules\Dashboard\Stats;
use App\Modules\Dashboard\Charts\AreaChart;
use App\Modules\Dashboard\Charts\BarChart;
use App\Modules\Dashboard\Charts\LineChart;
use App\Modules\Dashboard\Charts\PieChart;
use App\Modules\Dashboard\Charts\RadarChart;
use App\Modules\Dashboard\Charts\RadialChart;
use Spark\Http\Request;

class DashboardController extends Controller
{
    public function overview(Request $request)
    {
        // Read optional date range from query parameters
        $from = $request->input('from');
        $to = $request->input('to');

        // In a real application, you would fetch and calculate these values based on the selected date range.
        // For this example, we'll use static data to demonstrate the dashboard structure.
        $dashboard = Dashboard::make('Dashboard', 'Your analytics overview at a glance.')
            ->dateRange('/admin', [
                ['label' => '7D', 'days' => 7],
                ['label' => '14D', 'days' => 14],
                ['label' => '30D', 'days' => 30],
                ['label' => '90D', 'days' => 90],
            ])
            ->activeDateRange($from, $to)
            ->stats([
                Stats::make('Total Revenue')
                    ->value('$1,250.00')
                    ->change(12.5)
                    ->trend('up')
                    ->footer('Trending up this month')
                    ->description('Visitors for the last 6 months'),

                Stats::make('New Customers')
                    ->value('1,234')
                    ->change(-20)
                    ->trend('down')
                    ->footer('Down 20% this period')
                    ->description('Acquisition needs attention'),

                Stats::make('Active Accounts')
                    ->value('45,678')
                    ->change(12.5)
                    ->trend('up')
                    ->footer('Strong user retention')
                    ->description('Engagement exceed targets'),

                Stats::make('Growth Rate')
                    ->value('4.5%')
                    ->change(4.5)
                    ->trend('up')
                    ->footer('Steady performance increase')
                    ->description('Meets growth projections'),
            ])
            ->charts([
                // Row 1: Bar (2 cols) + Pie (1 col) — matched heights
                BarChart::make('Monthly Revenue')
                    ->description('Revenue vs Expenses over the last 6 months')
                    ->xAxisKey('month')
                    ->dataKeys(['revenue', 'expenses'])
                    ->colors(['hsl(221, 83%, 53%)', 'hsl(0, 84%, 60%)'])
                    ->colSpan(2)
                    ->height(350)
                    ->data([
                        ['month' => 'Jan', 'revenue' => 4000, 'expenses' => 2400],
                        ['month' => 'Feb', 'revenue' => 3000, 'expenses' => 1398],
                        ['month' => 'Mar', 'revenue' => 5000, 'expenses' => 3800],
                        ['month' => 'Apr', 'revenue' => 4780, 'expenses' => 3908],
                        ['month' => 'May', 'revenue' => 5890, 'expenses' => 4800],
                        ['month' => 'Jun', 'revenue' => 6390, 'expenses' => 3800],
                    ]),

                PieChart::make('Browser Share')
                    ->description('Visitor browser distribution')
                    ->dataKeys(['value'])
                    ->colors([
                        'hsl(221, 83%, 53%)',
                        'hsl(262, 83%, 58%)',
                        'hsl(173, 58%, 39%)',
                        'hsl(43, 96%, 56%)',
                        'hsl(0, 84%, 60%)',
                    ])
                    ->colSpan(1)
                    ->height(350)
                    ->data([
                        ['name' => 'Chrome', 'value' => 62],
                        ['name' => 'Safari', 'value' => 19],
                        ['name' => 'Firefox', 'value' => 10],
                        ['name' => 'Edge', 'value' => 6],
                        ['name' => 'Other', 'value' => 3],
                    ]),

                // Row 2: Area (2 cols) + Line (1 col) — matched heights
                AreaChart::make('Traffic Overview')
                    ->description('Visitors and page views over the last 7 months')
                    ->xAxisKey('month')
                    ->dataKeys(['visitors', 'pageViews'])
                    ->colors(['hsl(173, 58%, 39%)', 'hsl(197, 37%, 24%)'])
                    ->colSpan(2)
                    ->height(320)
                    ->data([
                        ['month' => 'Jan', 'visitors' => 1200, 'pageViews' => 4200],
                        ['month' => 'Feb', 'visitors' => 1900, 'pageViews' => 5100],
                        ['month' => 'Mar', 'visitors' => 1700, 'pageViews' => 4800],
                        ['month' => 'Apr', 'visitors' => 2100, 'pageViews' => 6200],
                        ['month' => 'May', 'visitors' => 2500, 'pageViews' => 7100],
                        ['month' => 'Jun', 'visitors' => 2300, 'pageViews' => 6800],
                        ['month' => 'Jul', 'visitors' => 2800, 'pageViews' => 7900],
                    ]),

                LineChart::make('User Growth')
                    ->description('New user registrations trend')
                    ->xAxisKey('month')
                    ->dataKeys(['users'])
                    ->colors(['hsl(262, 83%, 58%)'])
                    ->colSpan(1)
                    ->height(320)
                    ->data([
                        ['month' => 'Jan', 'users' => 120],
                        ['month' => 'Feb', 'users' => 190],
                        ['month' => 'Mar', 'users' => 170],
                        ['month' => 'Apr', 'users' => 240],
                        ['month' => 'May', 'users' => 310],
                        ['month' => 'Jun', 'users' => 280],
                        ['month' => 'Jul', 'users' => 350],
                    ]),

                // Row 3: Radar (1 col) + Radial (1 col) + Stacked Bar (1 col)
                RadarChart::make('Performance Metrics')
                    ->description('Current vs target KPIs')
                    ->xAxisKey('metric')
                    ->dataKeys(['current', 'target'])
                    ->colors(['hsl(221, 83%, 53%)', 'hsl(0, 84%, 60%)'])
                    ->colSpan(1)
                    ->height(320)
                    ->data([
                        ['metric' => 'Speed', 'current' => 86, 'target' => 90],
                        ['metric' => 'Quality', 'current' => 95, 'target' => 85],
                        ['metric' => 'Uptime', 'current' => 99, 'target' => 99],
                        ['metric' => 'Satisfaction', 'current' => 88, 'target' => 92],
                        ['metric' => 'Efficiency', 'current' => 78, 'target' => 80],
                        ['metric' => 'Security', 'current' => 92, 'target' => 95],
                    ]),

                RadialChart::make('Goal Completion')
                    ->description('Quarterly targets progress')
                    ->dataKeys(['value'])
                    ->colors([
                        'hsl(221, 83%, 53%)',
                        'hsl(173, 58%, 39%)',
                        'hsl(262, 83%, 58%)',
                        'hsl(43, 96%, 56%)',
                    ])
                    ->colSpan(1)
                    ->height(320)
                    ->data([
                        ['name' => 'Sales', 'value' => 78],
                        ['name' => 'Support', 'value' => 92],
                        ['name' => 'Marketing', 'value' => 65],
                        ['name' => 'Engineering', 'value' => 88],
                    ]),

                BarChart::make('Weekly Orders')
                    ->description('Order volume by product category')
                    ->xAxisKey('day')
                    ->dataKeys(['electronics', 'clothing', 'food'])
                    ->colors([
                        'hsl(221, 83%, 53%)',
                        'hsl(262, 83%, 58%)',
                        'hsl(173, 58%, 39%)',
                    ])
                    ->colSpan(1)
                    ->height(320)
                    ->data([
                        ['day' => 'Mon', 'electronics' => 45, 'clothing' => 30, 'food' => 55],
                        ['day' => 'Tue', 'electronics' => 52, 'clothing' => 35, 'food' => 48],
                        ['day' => 'Wed', 'electronics' => 38, 'clothing' => 42, 'food' => 62],
                        ['day' => 'Thu', 'electronics' => 65, 'clothing' => 28, 'food' => 51],
                        ['day' => 'Fri', 'electronics' => 78, 'clothing' => 55, 'food' => 70],
                        ['day' => 'Sat', 'electronics' => 90, 'clothing' => 68, 'food' => 85],
                        ['day' => 'Sun', 'electronics' => 72, 'clothing' => 48, 'food' => 65],
                    ]),
            ]);

        return inertia('admin/dashboard', [
            'dashboard' => $dashboard->toArray(),
        ]);
    }
}
