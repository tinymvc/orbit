<?php

namespace Orbit\Http\Controllers;

use App\Http\Controllers\Controller;
use Orbit\Services\Dashboard;
use Spark\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return fireline('orbit::dashboard');
    }

    public function menu(Request $request, Dashboard $dashboard)
    {
        $slug = $request->getRouteParam(0);
        $menuItem = $dashboard->findMenuItemBySlug($slug);

        if ($menuItem) {
            return fireline('orbit::menu.page', compact('menuItem'));
        }

        abort(404);
    }
}