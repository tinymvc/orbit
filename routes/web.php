<?php

use App\Http\Controllers\{
    AuthController,
    DashboardController,
    NotificationsController,
    RolesController,
    UsersController,
};
use App\Http\Resources\{
    CategoriesResource,
    PostsResource,
};
use App\Services\Orbit\Bread\ResourceController;
use Spark\Facades\Route;

Route::group(function () {
    Route::get('/login', [AuthController::class, 'login'])
        ->name('login');

    Route::get('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->name('password.forgot');

    Route::get('/reset-password', [AuthController::class, 'resetPassword'])
        ->name('password.reset');

    Route::post('/login', [AuthController::class, 'authenticate'])
        ->middleware('throttle:5,1,login')
        ->name('login.authenticate');

    Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])
        ->middleware('throttle:3,1,password-reset')
        ->name('password.email');

    Route::post('/reset-password', [AuthController::class, 'updatePassword'])
        ->middleware('throttle:5,1,password-reset')
        ->name('password.update');

    Route::get('/email-verification', [AuthController::class, 'emailVerification'])
        ->name('email.verification')
        ->middleware('throttle:10,1,email-verification');
})
    ->middleware('guest')
    ->prefix('admin');

Route::group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('logout');

    Route::get('/', [DashboardController::class, 'overview'])
        ->name('dashboard');

    Route::get('/notifications/feed', [NotificationsController::class, 'index'])
        ->name('notifications.feed');

    Route::post('/notifications', NotificationsController::class)
        ->name('notifications');

    Route::get('/profile', [AuthController::class, 'profile'])
        ->name('profile');

    Route::post('/profile', [AuthController::class, 'updateProfile'])
        ->middleware('throttle:10,1,profile')
        ->name('profile.update');

    Route::post('users/bulk-action', [UsersController::class, 'bulkAction'])
        ->middleware('throttle:5,1,user-actions')
        ->name('users.actions');

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
    ->middleware(['auth', 'throttle:120,1,admin'])
    ->prefix('admin');

Route::view('/', 'welcome')
    ->name('home');