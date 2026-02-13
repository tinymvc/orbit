<?php

use Orbit\Http\Controllers\{
    AuthController,
    DashboardController
};
use Spark\Facades\Route;

Route::group(function () {
    Route::match(['get', 'post'], '/login', [AuthController::class, 'login'])
        ->name('login')
        ->middleware('orbit.guest');

    Route::group(function () {
        Route::get('/', [DashboardController::class, 'index'])
            ->name('dashboard');

        Route::get('/*', [DashboardController::class, 'menu']);
    })
        ->middleware('orbit.auth');
})
    ->path(dashboard_prefix())
    ->name('orbit');