<?php

namespace App\Http\Requests;

use Spark\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function rules(): array
    {
        return ['user' => 'required|string|min:4|max:100'];
    }
}
