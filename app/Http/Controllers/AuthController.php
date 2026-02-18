<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spark\Facades\Auth;
use Spark\Facades\Hash;
use Spark\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        if ($request->isPost()) {
            $input = $request->validate([
                'user' => 'required|string|min:4|max:100',
                'password' => 'required|string|min:8|max:100',
                'remember_me' => 'nullable|boolean',
            ]);

            $user = User::where('username', $input['user'])
                ->orWhere('email', $input['user'])
                ->first();

            if (!$user || Hash::verify($input['password'], $user->password) === false) {
                return back()->withErrors([
                    'user' => 'Invalid credentials. Please check your username/email and password.',
                ]);
            }

            Auth::login($user, $input->boolean('remember_me')); // Log the user in

            $request->session()->regenerate();

            return redirect('/admin')
                ->with('success', 'You have successfully logged in!');
        }

        return inertia('auth/login');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->regenerate(deleteOldSession: true);

        return redirect('/admin/login')
            ->with('success', 'You have successfully logged out!');
    }
}
