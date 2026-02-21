<?php

/**
 * This file contains the route definitions for the web application.
 *
 * The routes defined in this file are used to map URLs to controller
 * actions or views. The routes are defined using the "router()" function,
 * which is a facade for the Hyper\Router class.
 */

use App\Http\Controllers\{
    AuthController,
    RolesController,
    UsersController
};
use Spark\Facades\Route;

Route::match(['get', 'post'], '/admin/login', [AuthController::class, 'login'])
    ->middleware('guest')
    ->name('admin.login');

Route::group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('logout');

    Route::inertia('/', 'admin/dashboard')
        ->name('dashboard');

    Route::match(['get', 'post'], '/profile', [AuthController::class, 'profile'])
        ->name('profile');

    Route::resource('users', UsersController::class)
        ->except(['create', 'edit', 'show'])
        ->name('users');

    Route::resource('roles', RolesController::class)
        ->except(['create', 'edit', 'show'])
        ->name('roles');
})
    ->middleware('auth')
    ->prefix('admin');

Route::get('/', fn() => dd('Hello World'));