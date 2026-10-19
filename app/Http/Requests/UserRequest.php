<?php

namespace App\Http\Requests;

use Spark\Facades\Gate;
use Spark\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('permission', 'users.' . ($this->isPost() ? 'create' : 'edit'));
    }

    public function rules(): array
    {
        $id = $this->route('id');
        $password = $this->isPost() ? 'required' : 'nullable';

        return [
            'first_name' => 'nullable|string|max:50',
            'last_name' => 'nullable|string|max:50',
            'roles' => 'required|array|min:1|max:50',
            'roles.*' => 'required|integer|min:1|exists:roles,id',
            'email' => "required|email|max:60|unique:users,email,$id",
            'username' => "required|string|min:4|max:60|unique:users,username,$id",
            'password' => "$password|string|min:8|max:100|confirmed",
        ];
    }
}
