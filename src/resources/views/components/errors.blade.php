@props(['fireline' => false, 'field'])

@if ($fireline)
    <div status="error" style="display: none;"
        class="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded">
    </div>
@elseif(isset($field))
    {{-- Single field error --}}
    @error($field)
        <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <div class="flex">
                <div class="shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-red-800 dark:text-red-200">
                        {{ is_array($message) ? $message[array_key_first($message)] : $message }}
                    </p>
                </div>
            </div>
        </div>
    @enderror
@elseif(errors()->any())
    {{-- All errors --}}
    <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
        <div class="flex">
            <div class="shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                @php
                    $errors = errors()->all();
                @endphp
                <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                    There {{ count($errors) === 1 ? 'is' : 'are' }} {{ count($errors) }}
                    error{{ count($errors) === 1 ? '' : 's' }} with your submission
                </h3>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                    <ul class="list-disc space-y-1 pl-5">
                        @foreach ($errors as $field => $messages)
                            @foreach ((array) $messages as $message)
                                <li>{{ $message }}</li>
                            @endforeach
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    </div>
@endisset
