<?php

namespace App\Http\Requests;

use Spark\Carbon;
use Spark\Database\Model;
use Spark\Facades\Gate;
use Spark\Foundation\Http\FormRequest;

/** The resource class supplies rules and permissions for generic BREAD routes. */
class ResourceWriteRequest extends FormRequest
{
    public function __construct(private string $resource, private ?Model $record = null)
    {
        parent::__construct();
    }

    public function authorize(): bool
    {
        $permission = $this->record
            ? $this->resource::getEditPerm()
            : $this->resource::getCreatePerm();

        return !$permission || Gate::allows('permission', $permission);
    }

    public function rules(): array
    {
        $id = $this->record?->id;
        $rules = ($this->record ? $this->resource::updateRules($id) : $this->resource::storeRules())
            ?? $this->resource::buildRulesFromFields($id);

        // Upload contents and ownership are checked by the resource upload workflow.
        foreach ($this->resource::getFileFields() as $field) {
            $name = $field->getName();
            unset($rules[$name]);

            if (
                $field->isRequired() && !$this->hasFile($name)
                && (!$this->record || empty($this->record->{$name}) || ($this->has($name) && empty($this->input($name))))
            ) {
                $this->mergePostParams([$name => null]);
                $rules[$name] = 'required';
            }
        }

        foreach ($this->resource::getRelationshipFields() as $field) {
            unset($rules[$field->getName()]);
        }

        return $rules;
    }

    public function passedValidation(): void
    {
        $input = $this->validated();

        foreach ($this->resource::fields() as $field) {
            $name = $field->getName();

            if ($field->getType() === 'datetime' && $input[$name]) {
                $input[$name] = Carbon::parse($input[$name])
                    ->setTimezone('UTC')
                    ->toDateTimeString();
            }
        }
    }
}
