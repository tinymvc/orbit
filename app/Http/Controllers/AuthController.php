<?php

namespace App\Http\Controllers;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\AuthServices;
use Spark\Facades\Auth;
use Spark\Facades\Hash;
use Spark\Facades\Log;
use Spark\Http\Request;
use function in_array;

class AuthController extends Controller
{
    public function __construct(private AuthServices $auth)
    {
    }

    public function login()
    {
        return inertia('auth/login');
    }

    public function authenticate(LoginRequest $request)
    {
        $this->auth->login($request->validated());

        $request->session()->regenerate(deleteOldSession: true);

        return redirect(Auth::getRedirectRoute())
            ->with('success', 'You have successfully logged in!');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->regenerate(deleteOldSession: true);

        return redirect(Auth::getLoginRoute())
            ->with('success', 'You have successfully logged out!');
    }

    public function profile()
    {
        return inertia('admin/profile');
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $this->auth->updateProfile(Auth::user(), $request->validated());

        return back()->with('success', 'Profile updated successfully.');
    }

    public function forgotPassword()
    {
        return inertia('auth/forgot-password');
    }

    public function sendResetLink(ForgotPasswordRequest $request)
    {
        $user = $this->auth->findUser($request->validated()->string('user'));

        if ($user && in_array($user->status, ['active', 'verified'], true)) {
            try {
                $this->auth->sendPasswordResetNotification($user);
            } catch (\Exception $error) {
                Log::error('Password reset request failed.', ['user_id' => $user->id, 'error' => $error->getMessage()]);

                return back()->withErrors(['user' => 'An error occurred while processing your request. Please try again later.']);
            }
        }

        return redirect(Auth::getLoginRoute())
            ->with('success', 'If an eligible account exists, a password reset link has been sent to its email address.');
    }

    public function resetPassword(Request $request)
    {
        try {
            Hash::decrypt($request->string('token'));
        } catch (\Exception) {
            return redirect(Auth::getLoginRoute())
                ->with('error', 'The password reset link is invalid. Please request a new password reset link.');
        }

        return inertia('auth/reset-password', ['token' => $request->input('token')]);
    }

    public function updatePassword(ResetPasswordRequest $request)
    {
        $input = $request->validated();

        if (!$this->auth->resetPassword($input->string('token'), $input->password())) {
            return redirect(Auth::getLoginRoute())
                ->with('error', 'The password reset link is invalid or has expired. Please request a new password reset link.');
        }

        return redirect(Auth::getLoginRoute())
            ->with('success', 'Your password has been reset successfully. You can now log in with your new password.');
    }

    public function emailVerification(Request $request)
    {
        $input = $request->validate(['token' => 'required|string|max:4096']);
        $user = $this->auth->verifyEmail($input->string('token'));

        if (!$user) {
            return redirect(Auth::getLoginRoute())
                ->with('error', 'The email verification link is invalid. Please contact support for assistance.');
        }

        Auth::login($user);
        $request->session()->regenerate(deleteOldSession: true);

        return redirect(Auth::getRedirectRoute())
            ->with('success', 'Your email has been verified successfully. Welcome to the dashboard!');
    }
}
