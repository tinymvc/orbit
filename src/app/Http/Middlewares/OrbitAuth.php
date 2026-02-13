<?php

namespace Orbit\Http\Middlewares;

use Spark\Contracts\Http\MiddlewareInterface;
use Spark\Http\Request;

class OrbitAuth implements MiddlewareInterface
{
    public function handle(Request $request, \Closure $next): mixed
    {
        if (is_guest()) {
            $request->session()->flash('__auth_redirect', $request->getUri());
            return redirect(auth()->getLoginRoute());
        }

        return $next($request);
    }
}
