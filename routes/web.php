<?php

/**
 * This file contains the route definitions for the web application.
 *
 * The routes defined in this file are used to map URLs to controller
 * actions or views. The routes are defined using the "router()" function,
 * which is a facade for the Hyper\Router class.
 */

use Spark\Facades\Route;

Route::get(
    '/about',
    fn() => inertia('about', [
        'name' => 'Shahinul Islam',
        'age' => 23,
    ])
);
Route::get('/', fn() => inertia('home'));