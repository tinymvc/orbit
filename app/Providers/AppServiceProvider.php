<?php

namespace App\Providers;

use Inertia\Inertia;
use Spark\Facades\{Validator, Auth, Gate};
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
        // Register any application services here.
    }

    public function boot(): void
    {
        // Sharing the application name with all Inertia views
        Inertia::share([
            'app' => Inertia::once(fn() => [
                'name' => config('app.name', 'Orbit'),
                'locale' => config('app.locale', 'en'),
            ]),
        ]);

        // Resolve the current user when rendering, including after login/logout.
        Inertia::share([
            'auth' => Inertia::always(fn() => ['user' => Auth::user()]),
            'notifications' => Inertia::always(fn() => [
                'unreadCount' => Auth::check()
                    ? Auth::user()->notifications()->whereNull('read_at')->count()
                    : 0,
            ]),
        ]);

        // defining a gate for checking user permissions based on privileges
        Gate::define(
            'permission',
            fn(array|string $privileges): bool => Auth::check() && Auth::user()->can($privileges)
        );

        // customize human friendly validation messages
        Validator::setErrorMessages([
            'exists' => 'Please provide a valid %s. We couldn\'t find it in our database.',
            'not_exists' => 'The %s you entered already exists in our database. Please use a different value.',
            'password' => 'The %s must contain at least one uppercase letter, one lowercase letter, and one number.',
            'unique' => [
                'username' => 'That %s is already taken. Please choose a different username.',
                'email' => 'That %s is already registered. Please use a different email address.',
                'default' => 'The %s must be unique in our database. Please choose a different value.',
            ],
        ]);
    }
}