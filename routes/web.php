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
    UsersController
};
use Spark\Facades\Route;

Route::match(['get', 'post'], '/admin/login', [AuthController::class, 'login'])
    ->middleware('guest');

Route::group(function () {
    Route::inertia('/', 'admin/dashboard');
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::resource('users', UsersController::class)
        ->except(['create', 'edit', 'show']);
})
    ->middleware('auth')
    ->prefix('admin');

Route::get('/', fn() => dd('Hello World'));