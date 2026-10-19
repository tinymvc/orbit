<?php

namespace App\Http\Requests;

use Spark\Facades\Auth;
use Spark\Foundation\Http\FormRequest;

class NotificationActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'action' => 'required|string|in:mark-read,mark-all-read,remove,clear',
            'id' => 'required_if:action,mark-read,remove|nullable|integer|min:1|regex:/^[1-9][0-9]*$/',
        ];
    }
}
