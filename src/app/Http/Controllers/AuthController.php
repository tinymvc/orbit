<?php

namespace Orbit\Http\Controllers;

use App\Http\Controllers\Controller;
use Spark\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        if ($request->isPost()) {
            $input = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6|max:100',
            ]);

            if (auth()->attempt($input->toArray())) {
                return [
                    'status' => 'success',
                    'redirect' => auth()->getRedirectRoute()
                ];
            }

            return [
                'status' => 'error',
                'message' => 'The provided credentials do not match our records.'
            ];
        }

        return view('orbit::auth.login');
    }
}
