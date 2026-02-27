<?php

namespace App\Providers;

use App\Models\Notification;
use Inertia\Facades\Inertia;
use Inertia\Facades\Props;
use Spark\Facades\Auth;
use Spark\Facades\Gate;
use Spark\Foundation\Providers\ServiceProvider;
use Spark\Http\Validator;

/**
 * This file contains the service providers for the web application.
 * 
 * @package App\Providers
 */
class OrbitServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // configure auth to use caching
        Auth::configure([
            'cache_enabled' => true,
            'use_remember_token' => true,
            'cache_expire' => '5 minutes',
            'login_route' => 'admin.login',
            'redirect_route' => 'admin.dashboard',
        ]);
    }

    public function boot(): void
    {
        // Sharing the application name with all Inertia views
        Inertia::share([
            'app' => Props::once(fn() => [
                'name' => config('app.name', 'Inertia Php'),
                'timezone' => config('app.timezone', 'UTC'),
                'locale' => config('lang', 'en'),
            ]),
        ]);

        // Share notification data for the logged-in user
        if (is_logged()) {
            Inertia::share([
                // Always evaluated — badge count on every page
                'notifications' => Props::always(fn() => [
                    'unreadCount' => Notification::where('user_id', user('id'))
                        ->whereNull('read_at')
                        ->count(),
                ]),
                // Lazy — only evaluated when explicitly requested via router.reload({ only: ['notificationItems'] })
                'notificationItems' => Props::lazy(
                    Notification::where('user_id', user('id'))
                        ->latest('id')
                        ->limit(20)
                        ->all(...)
                ),
            ]);
        }

        // defining a gate for checking user permissions based on privileges
        Gate::define(
            'permission',
            fn(array|string $privileges): bool => is_logged() && user()->can($privileges)
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