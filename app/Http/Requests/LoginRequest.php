<?php

namespace App\Http\Requests;

use Spark\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user' => 'required|string|min:4|max:100',
            'password' => 'required|string|min:8|max:100',
            'remember_me' => 'nullable|boolean',
        ];
    }
}
