<?php

namespace App\Http\Requests;

use Spark\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'token' => 'required|string|max:4096',
            'password' => 'required|string|min:8|max:100|confirmed',
        ];
    }
}
