<?php

namespace Orbit\Providers;

use Orbit\Services\Dashboard;
use Spark\Facades\Blade;
use Spark\Foundation\Providers\ServiceProvider;
use Spark\Http\Auth;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Dashboard::class);

        // Customized Auth service registration with configuration
        $this->app->singleton(Auth::class, fn() => new Auth(config: [
            'session_key' => 'user_id',
            'cache_enabled' => true,
            'cache_name' => 'auth_cache',
            'cache_expire' => '10 minutes',
            'login_route' => 'orbit.login',
            'redirect_route' => 'orbit.dashboard',
            'cookie_enabled' => true,
            'cookie_name' => 'auth',
            'cookie_expire' => '6 months',
        ]));

        // Register middlewares for authentication and guest access
        $this->app->withMiddleware(register: [
            'orbit.auth' => \Orbit\Http\Middlewares\OrbitAuth::class,
            'orbit.guest' => \Orbit\Http\Middlewares\OrbitGuest::class,
        ]);

        // Register routes for the CMS
        $this->app->withRouting(
            web: orbit_path("/routes/web.php")
        );
    }

    public function boot(): void
    {
        // Load console routes if running in CLI mode
        is_cli() && require orbit_path("/routes/console.php");

        // Register Blade view path for the CMS
        Blade::usePath(orbit_path("/resources/views"), 'orbit');

        /** @var \Orbit\Services\Dashboard $dashboard */
        $dashboard = $this->app->get(Dashboard::class);
        $dashboard->init();
    }
}