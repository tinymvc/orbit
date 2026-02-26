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
    DashboardController,
    RolesController,
    UsersController
};
use App\Http\Resources\{
    CategoriesResource,
    PostsResource
};
use App\Modules\Bread\ResourceController;
use Spark\Facades\Route;

Route::group(function () {
    Route::match(['get', 'post'], '/login', [AuthController::class, 'login'])
        ->name('login');

    Route::match(['get', 'post'], '/forgot-password', [AuthController::class, 'forgotPassword'])
        ->name('password.forgot');

    Route::match(['get', 'post'], '/reset-password', [AuthController::class, 'resetPassword'])
        ->name('password.reset');

    Route::get('/email-verification', [AuthController::class, 'emailVerification'])
        ->name('email.verification');
})
    ->middleware('guest')
    ->prefix('admin');

Route::group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('logout');

    Route::get('/', [DashboardController::class, 'overview'])
        ->name('dashboard');

    Route::match(['get', 'post'], '/profile', [AuthController::class, 'profile'])
        ->name('profile');

    Route::post('users/bulk-action', [UsersController::class, 'bulkAction']);
    Route::resource('users', UsersController::class)
        ->except(['create', 'edit', 'show'])
        ->name('users');

    Route::resource('roles', RolesController::class)
        ->except(['create', 'edit', 'show'])
        ->name('roles');

    // ─── BREAD Resources  ────
    ResourceController::routes(PostsResource::class);
    ResourceController::routes(CategoriesResource::class);
})
    ->middleware('auth')
    ->prefix('admin');

Route::get('/', fn() => dd('Hello World'));