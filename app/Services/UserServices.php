<?php

namespace App\Services;

use App\Models\User;
use Spark\Facades\DB;
use Spark\Facades\Log;
use Spark\Http\Input;
use function in_array;

class UserServices
{
    public function __construct(private AuthServices $auth)
    {
    }

    public function save(Input $input, ?User $user = null): User
    {
        return DB::transaction(function () use ($input, $user) {
            $user ??= new User();
            $user->fill($input->except(['roles', 'password']));

            if ($input->string('password') !== '') {
                $user->password = $input->string('password');
            }

            if (!$user->save()) {
                throw new \RuntimeException('Unable to save user.');
            }

            $user->roles()->sync($input->array('roles'));

            return $user;
        });
    }

    /** @return array{string, string} Flash level and message. */
    public function bulkAction(Input $input): array
    {
        $action = $input->string('action');
        $ids = $input->array('ids');

        if ($action === 'delete') {
            User::destroy($ids);

            return ['success', 'Selected users deleted successfully.'];
        }

        if (in_array($action, ['active', 'inactive', 'suspended', 'banned'], true)) {
            User::whereIn('id', $ids)->update(['status' => $action]);

            return ['success', 'Selected users updated successfully.'];
        }

        $failed = 0;

        foreach (User::whereIn('id', $ids)->get() as $user) {
            try {
                if ($action === 'send-reset-link') {
                    $this->auth->sendPasswordResetNotification($user);
                } elseif (!$user->hasVerifiedEmail()) {
                    $this->auth->sendEmailVerificationNotification($user);
                }
            } catch (\Exception $error) {
                $failed++;
                Log::error('Failed to send account notification.', [
                    'user_id' => $user->id,
                    'error' => $error->getMessage(),
                ]);
            }
        }

        return $failed
            ? ['error', "Failed to send $failed account notifications. Please try again."]
            : ['success', 'Account notifications sent successfully.'];
    }
}
