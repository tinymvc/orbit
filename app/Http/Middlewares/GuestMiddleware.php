<?php

namespace App\Http\Middlewares;

use Inertia\Facades\Inertia;
use Spark\Contracts\Http\MiddlewareInterface;
use Spark\Http\Request;

class GuestMiddleware implements MiddlewareInterface
{
    public function handle(Request $request, \Closure $next): mixed
    {
        if ($request->auth()->hasId()) {
            return Inertia::redirect('/admin');
        }

        return $next($request);
    }
}
