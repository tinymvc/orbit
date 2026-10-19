<?php

namespace App\Http\Requests;

use Spark\Facades\Gate;
use Spark\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('permission', 'roles.' . ($this->isPost() ? 'create' : 'edit'));
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name' => 'required|string|max:100',
            'slug' => "required|string|max:150|unique:roles,slug,$id",
            'privileges' => 'required|array|min:1|max:200',
            'privileges.*' => ['required', 'string', ['in' => privileges_list()->collapse()->keys()->all()]],
        ];
    }
}
