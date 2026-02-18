<?php

namespace App\Providers;

use Inertia\Facades\Inertia;
use Spark\Foundation\Providers\ServiceProvider;

/**
 * This file contains the service providers for the web application.
 * 
 * @package App\Providers
 */
class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // i am registering services
    }

    public function boot(): void
    {
        // Sharing the application name with all Inertia views
        Inertia::share([
            'app' => [
                'name' => config('app.name', 'TinyMvc'),
                'timezone' => config('app.timezone', 'UTC'),
                'locale' => config('lang', 'en'),
            ],
        ]);
    }
}