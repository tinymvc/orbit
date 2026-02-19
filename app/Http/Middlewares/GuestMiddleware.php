<?php

namespace App\Http\Middlewares;

use Inertia\Facades\Inertia;
use Spark\Contracts\Http\MiddlewareInterface;
use Spark\Http\Request;

class GuestMiddleware implements MiddlewareInterface
{
    public function handle(Request $request, \Closure $next): mixed
    {
        if ($request->auth()->isLogged()) {
            return Inertia::redirect(
                $request->auth()->getRedirectRoute()
            );
        }

        return $next($request);
    }
}
