<?php

namespace App\Services;

use App\Models\ResetPasswordLink;
use App\Models\User;
use Spark\Facades\Auth;
use Spark\Facades\DB;
use Spark\Facades\Hash;
use Spark\Facades\Mail;
use Spark\Foundation\Exceptions\ValidationException;
use Spark\Http\Input;
use function in_array;

class AuthServices
{
    public function findUser(string $identifier): ?User
    {
        return User::where('username', $identifier)
            ->orWhere('email', $identifier)
            ->first();
    }

    public function login(Input $input): void
    {
        $user = $this->findUser($input->string('user'));

        if (!$user || !$user->password($input->password())) {
            throw ValidationException::withMessages([
                'user' => ['Invalid credentials. Please check your username/email and password.'],
            ]);
        }

        if ($user->status !== User::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'user' => ['Your account status does not allow you to log in. Please contact support for assistance.'],
            ]);
        }

        Auth::login($user, $input->boolean('remember_me'));
    }

    public function updateProfile(User $user, Input $input): void
    {
        if ($input->string('action') === 'password') {
            if (!$user->password($input->string('current_password'))) {
                throw ValidationException::withMessages([
                    'current_password' => ['The current password you entered is incorrect.'],
                ]);
            }

            $user->password = $input->string('password');
        } else {
            $user->fill($input->only(['first_name', 'last_name', 'username', 'email']));
        }

        if (!$user->save()) {
            throw new \RuntimeException('Unable to update profile.');
        }
    }

    public function sendPasswordResetNotification(User $user): void
    {
        $token = Hash::random(60);
        $link = ResetPasswordLink::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addMinutes(60),
        ]);

        try {
            $sent = Mail::to($user->email, $user->display_name)
                ->subject('Password Reset Request')
                ->view('emails.password-reset', [
                    'user' => $user,
                    'token' => Hash::encrypt($token),
                ])
                ->send();

            if (!$sent) {
                throw new \RuntimeException('Failed to send password reset email.');
            }
        } catch (\Throwable $error) {
            $link->remove();

            throw $error;
        }
    }

    public function resetPassword(string $encryptedToken, string $password): bool
    {
        try {
            $token = Hash::decrypt($encryptedToken);
        } catch (\Exception) {
            return false;
        }

        return DB::transaction(function () use ($token, $password) {
            $link = ResetPasswordLink::where('token', $token)
                ->where('used', 0)
                ->where('expires_at', '>', now())
                ->first();

            $user = $link?->user;

            if (!$user) {
                return false;
            }

            // Claim the token atomically before changing the password.
            $claimed = ResetPasswordLink::where('id', $link->id)
                ->where('used', 0)
                ->where('expires_at', '>', now())
                ->update(['used' => true, 'updated_at' => now()]);

            if (!$claimed) {
                return false;
            }

            $user->password = $password;

            if (!$user->save()) {
                throw new \RuntimeException('Unable to reset password.');
            }

            return true;
        });
    }

    public function sendEmailVerificationNotification(User $user): void
    {
        $token = Hash::encryptArray([
            'user_id' => $user->id,
            'email' => $user->email,
            'timestamp' => now()->toDateTimeString(),
        ]);

        $sent = Mail::to($user->email, $user->display_name)
            ->subject('Email Verification')
            ->view('emails.email-verification', ['user' => $user, 'token' => $token])
            ->send();

        if (!$sent) {
            throw new \RuntimeException('Failed to send email verification.');
        }
    }

    public function verifyEmail(string $encryptedToken): ?User
    {
        try {
            $token = Hash::decryptArray($encryptedToken);

            if (!isset($token['user_id'], $token['timestamp'])) {
                return null;
            }

            $issuedAt = carbon($token['timestamp']);

            if ($issuedAt->isFuture() || $issuedAt->addMinutes(60)->isPast()) {
                return null;
            }

            $user = User::find($token['user_id']);

            if (!$user || (isset($token['email']) && $token['email'] !== $user->email)) {
                return null;
            }

            if (in_array($user->status, [User::STATUS_BANNED, User::STATUS_SUSPENDED], true)) {
                return null;
            }

            $user->fill(['status' => User::STATUS_ACTIVE, 'email_verified_at' => now()]);

            return $user->save() ? $user : null;
        } catch (\Exception) {
            return null;
        }
    }
}
