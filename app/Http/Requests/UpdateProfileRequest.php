<?php

namespace App\Http\Requests;

use Spark\Facades\Auth;
use Spark\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        $id = Auth::id();

        return [
            'action' => 'required|string|in:general,password',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'username' => "required_if:action,general|nullable|string|min:4|max:50|unique:users,username,$id",
            'email' => "required_if:action,general|nullable|email|max:100|unique:users,email,$id",
            'current_password' => 'required_if:action,password|nullable|string|min:8|max:100',
            'password' => 'required_if:action,password|nullable|string|min:8|max:100|confirmed',
        ];
    }
}
