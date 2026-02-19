<?php

namespace App\Http\Middlewares;

use Inertia\Facades\Inertia;
use Spark\Contracts\Http\MiddlewareInterface;
use Spark\Http\Request;

class AuthMiddleware implements MiddlewareInterface
{
    public function handle(Request $request, \Closure $next): mixed
    {
        if ($request->auth()->isGuest()) {
            $request->session()
                ->flash('__auth_redirect', $request->getUrl());

            return Inertia::redirect(
                $request->auth()->getLoginRoute()
            );
        }

        return $next($request);
    }
}
