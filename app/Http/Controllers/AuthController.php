<?php

namespace App\Http\Controllers;

use App\Models\ResetPasswordLink;
use App\Models\User;
use Spark\Facades\Auth;
use Spark\Facades\Hash;
use Spark\Facades\Log;
use Spark\Http\Request;
use function in_array;

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

            if ($user->status !== 'active') {
                $message = match ($user->status) {
                    'inactive' => 'Your account is currently inactive. Please contact support for assistance.',
                    'banned' => 'Your account has been banned. Please contact support for assistance.',
                    'verified' => 'Your email address is verified, but your account is not active. Please contact support for assistance.',
                    'unverified' => 'Your account is not verified. Please check your email for the verification link.',
                    default => 'Your account status does not allow you to log in. Please contact support for assistance.',
                };

                return back()->with('error', $message);
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

    public function forgotPassword(Request $request)
    {
        if ($request->isPost()) {
            $input = $request->validate([
                'user' => 'required|string|min:4|max:100',
            ]);

            /** @var \App\Models\User */
            $user = User::where('username', $input['user'])
                ->orWhere('email', $input['user'])
                ->first();

            if (!$user || !in_array($user->status, ['active', 'verified'])) {
                return back()->withErrors([
                    'user' => 'No active account found with the provided username or email. Please check your input and try again.',
                ]);
            }

            try {
                send_forgot_password_email($user);
            } catch (\Exception $e) {
                Log::error("Password reset request failed for user ID {$user->id}: " . $e->getMessage());
                return back()->withErrors([
                    'user' => 'An error occurred while processing your request. Please try again later.',
                ]);
            }

            return redirect(Auth::getLoginRoute())
                ->with('success', 'The reset password link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.');
        }

        return inertia('auth/forgot-password');
    }

    public function resetPassword(Request $request)
    {
        try {
            $token = Hash::decrypt(
                $request->input('token', '')
            );
        } catch (\Exception $e) {
            return redirect(Auth::getLoginRoute())
                ->with('error', 'The password reset link is invalid. Please request a new password reset link.');
        }

        if ($request->isPost()) {
            $input = $request->validate([
                'password' => 'required|string|min:8|max:100|confirmed',
            ]);

            /** @var ResetPasswordLink */
            $resetLink = ResetPasswordLink::where('token', $token)
                ->where('used', 0)
                ->where('expires_at', '>', now())
                ->first();

            if (!$resetLink) {
                return redirect(Auth::getLoginRoute())
                    ->with('error', 'The password reset link is invalid or has expired. Please request a new password reset link.');
            }

            /** @var User */
            $user = $resetLink->user;

            if (!$user) {
                return redirect(Auth::getLoginRoute())
                    ->with('error', 'No user found for this password reset link. Please request a new password reset link.');
            }

            $user->password = $input->safe('password');
            $user->save();

            // Mark the reset link as used
            $resetLink->update(['used' => true, 'updated_at' => now()]);

            return redirect(Auth::getLoginRoute())
                ->with('success', 'Your password has been reset successfully. You can now log in with your new password.');
        }

        return inertia('auth/reset-password', [
            'token' => $request->input('token'),
        ]);
    }
}
