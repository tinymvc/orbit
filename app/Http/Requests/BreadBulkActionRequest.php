<?php

namespace App\Http\Requests;

use Spark\Foundation\Exceptions\ValidationException;
use Spark\Foundation\Http\FormRequest;
use function is_int;
use function is_string;

class BreadBulkActionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'action' => 'required|string|max:100',
            'ids' => 'required|array|min:1|max:500',
        ];
    }

    public function passedValidation(): void
    {
        foreach ($this->validated()->array('ids') as $id) {
            if (
                (!is_int($id) && !is_string($id))
                || !preg_match('/^[1-9][0-9]*$/', (string) $id)
            ) {
                throw ValidationException::withMessages([
                    'ids' => ['Select between 1 and 500 valid record IDs.'],
                ]);
            }
        }
    }
}
