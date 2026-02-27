<?php

namespace App\Providers;

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
    }

    public function boot(): void
    {
        // Set the default timezone for the application
        date_default_timezone_set(env('app.timezone', 'UTC'));
    }
}