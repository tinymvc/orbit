<?php

namespace App\Http\Requests;

use Spark\Facades\Gate;
use Spark\Foundation\Http\FormRequest;

class UserBulkActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('permission', $this->input('action') === 'delete' ? 'users.delete' : 'users.edit');
    }

    public function rules(): array
    {
        return [
            'action' => 'required|string|in:delete,active,inactive,suspended,banned,send-reset-link,send-email-verification',
            'ids' => 'required|array|min:1|max:500',
            'ids.*' => 'required|integer|min:1|regex:/^[1-9][0-9]*$/',
        ];
    }
}
