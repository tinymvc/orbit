<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spark\Facades\Auth;
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

            /** @var \App\Models\User */
            $user = User::where('username', $input['user'])
                ->orWhere('email', $input['user'])
                ->first();

            if (!$user || $user->password($input->safe('password')) === false) {
                return back()->withErrors([
                    'user' => 'Invalid credentials. Please check your username/email and password.',
                ]);
            }

            Auth::login($user, $input->boolean('remember_me')); // Log the user in

            $request->session()->regenerate();

            return redirect(Auth::getRedirectRoute())
                ->with('success', 'You have successfully logged in!');
        }

        return inertia('auth/login');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->regenerate(deleteOldSession: true);

        return redirect(Auth::getLoginRoute())
            ->with('success', 'You have successfully logged out!');
    }

    public function profile(Request $request)
    {
        if ($request->isPost()) {
            $user = Auth::user();

            $input = $request->validate([
                'action' => 'string|in:general,password',
                'first_name' => 'nullable|string|min:4|max:100',
                'last_name' => 'nullable|string|min:4|max:100',
                'username' => 'required_if:action,general|nullable|string|min:4|max:50|unique:users,username,' . $user->id,
                'email' => 'required_if:action,general|nullable|email|max:100|unique:users,email,' . $user->id,
                'current_password' => 'required_if:action,password|nullable|string|min:8|max:100',
                'password' => 'required_if:action,password|nullable|string|min:8|max:100|confirmed',
            ]);

            if ($input['action'] === 'general') {
                $user->fill(
                    $input->only(['first_name', 'last_name', 'username', 'email'])
                );
                $user->save();

                return back()
                    ->with('success', 'Profile updated successfully.');
            } elseif ($input['action'] === 'password') {
                if ($user->password($input['current_password']) === false) {
                    return back()
                        ->withErrors([
                            'current_password' => 'The current password you entered is incorrect.'
                        ]);
                }

                $user->password = $input['password'];
                $user->save();

                return back()
                    ->with('success', 'Password updated successfully.');
            }

            return back()->with('error', 'Failed to update profile. Please try again.');
        }

        return inertia('admin/profile');
    }
}
