@php
    $fieldData = $field->toArray();
    $fieldName = $field->getName();
    $fieldType = $field->getType();
    $fieldValue = old($fieldName, $field->getValue());
    $hasError = errors()->has($fieldName);
    $errorMessage = $hasError ? (errors()->first($fieldName) ?: '') : '';

    // Conditional rendering
    if (!$field->isVisible($formData ?? [])) {
        return;
    }

    // Column span for grid
    $colSpan = $fieldData['columnSpan'] ?? 12;
    $colClass = match ($colSpan) {
        1 => 'col-span-1',
        2 => 'col-span-2',
        3 => 'col-span-3',
        4 => 'col-span-4',
        5 => 'col-span-5',
        6 => 'col-span-6',
        7 => 'col-span-7',
        8 => 'col-span-8',
        9 => 'col-span-9',
        10 => 'col-span-10',
        11 => 'col-span-11',
        default => 'col-span-12',
    };

    // Field dependency (Alpine.js)
    $alpineShow = '';
    if ($fieldData['dependsOn']) {
        $depField = $fieldData['dependsOn'];
        $depValues = $fieldData['dependsOnValues'];
        if (!empty($depValues)) {
            $valuesJson = json_encode($depValues);
            $alpineShow = "x-show=\"{$valuesJson}.includes(\$refs.{$depField}?.value)\"";
        }
    }
@endphp

<div class="{{ $colClass }}" {!! $alpineShow !!}>
    {{-- Label --}}
    @if ($fieldType !== 'hidden' && $fieldType !== 'checkbox')
        <label for="{{ $fieldName }}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $field->getLabel() }}
            @if ($field->isRequired())
                <span class="text-red-500">*</span>
            @endif
        </label>
    @endif

    {{-- Field based on type --}}
    @switch($fieldType)
        @case('text')
        @case('email')

        @case('url')
        @case('password')

        @case('number')
            <input type="{{ $fieldType }}" name="{{ $fieldName }}" id="{{ $fieldName }}" x-ref="{{ $fieldName }}"
                value="{{ $fieldValue }}" {!! $field->getAttributesString() !!}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm @error($fieldName) border-red-500 @enderror">
        @break

        @case('textarea')
            <textarea name="{{ $fieldName }}" id="{{ $fieldName }}" x-ref="{{ $fieldName }}" rows="4"
                {!! $field->getAttributesString() !!}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm @error($fieldName) border-red-500 @enderror">{{ $fieldValue }}</textarea>
        @break

        @case('rich_editor')
            <x-orbit::richtext :name="$fieldName" :value="$fieldValue" />
        @break

        @case('select')
            <select name="{{ $fieldName }}" id="{{ $fieldName }}" x-ref="{{ $fieldName }}" {!! $field->getAttributesString() !!}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm @error($fieldName) border-red-500 @enderror">
                @if ($fieldData['placeholder'] ?? false)
                    <option value="">{{ $fieldData['placeholder'] }}</option>
                @endif
                @foreach ($field->getOptions() as $value => $label)
                    <option value="{{ $value }}" @selected($fieldValue == $value)>{{ $label }}</option>
                @endforeach
            </select>
        @break

        @case('checkbox')
            <div class="flex items-start">
                <div class="flex items-center h-5">
                    <input type="checkbox" name="{{ $fieldName }}" id="{{ $fieldName }}" x-ref="{{ $fieldName }}"
                        value="1" @checked($fieldValue) {!! $field->getAttributesString() !!}
                        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700">
                </div>
                <div class="ml-3 text-sm">
                    <label for="{{ $fieldName }}" class="font-medium text-gray-700 dark:text-gray-300">
                        {{ $field->getLabel() }}
                        @if ($field->isRequired())
                            <span class="text-red-500">*</span>
                        @endif
                    </label>
                    @if ($fieldData['helperText'])
                        <p class="text-gray-500 dark:text-gray-400">{{ $fieldData['helperText'] }}</p>
                    @endif
                </div>
            </div>
        @break

        @case('radio')
            <div class="space-y-2">
                @foreach ($field->getOptions() as $value => $label)
                    <div class="flex items-center">
                        <input type="radio" name="{{ $fieldName }}" id="{{ $fieldName }}_{{ $value }}"
                            value="{{ $value }}" @checked($fieldValue == $value) {!! $field->getAttributesString() !!}
                            class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700">
                        <label for="{{ $fieldName }}_{{ $value }}"
                            class="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ $label }}
                        </label>
                    </div>
                @endforeach
            </div>
        @break

        @case('date')
        @case('datetime')

        @case('time')
            <input type="{{ $fieldType === 'datetime' ? 'datetime-local' : $fieldType }}" name="{{ $fieldName }}"
                id="{{ $fieldName }}" x-ref="{{ $fieldName }}" value="{{ $fieldValue }}" {!! $field->getAttributesString() !!}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm @error($fieldName) border-red-500 @enderror">
        @break

        @case('file')
        @case('image')
            <x-orbit::upload :field="$field" :value="$fieldValue" :type="$fieldType" />
        @break

        @case('color')
            <input type="color" name="{{ $fieldName }}" id="{{ $fieldName }}" x-ref="{{ $fieldName }}"
                value="{{ $fieldValue }}" {!! $field->getAttributesString() !!}
                class="block h-10 w-20 rounded-md border-gray-300 cursor-pointer">
        @break

        @case('hidden')
            <input type="hidden" name="{{ $fieldName }}" value="{{ $fieldValue }}">
        @break

        @default
            {{-- Custom field type - allow override --}}
            <input type="text" name="{{ $fieldName }}" id="{{ $fieldName }}" x-ref="{{ $fieldName }}"
                value="{{ $fieldValue }}" {!! $field->getAttributesString() !!}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm @error($fieldName) border-red-500 @enderror">
    @endswitch

    {{-- Helper Text --}}
    @if ($fieldData['helperText'] && $fieldType !== 'checkbox')
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ $fieldData['helperText'] }}</p>
    @endif

    {{-- Error Message --}}
    @if ($hasError)
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $errorMessage }}</p>
    @endif
</div>
