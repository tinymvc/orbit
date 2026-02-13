@extends('orbit::layout.master')

@section('content')

    @php
        $formAction = $form->getAction() ?? request()->getPath();
        $formMethod = $form->getMethod();
        $actualMethod = in_array($formMethod, ['GET', 'POST']) ? $formMethod : 'POST';
        $spoofMethod = !in_array($formMethod, ['GET', 'POST']) ? $formMethod : null;
        $tabs = $form->getTabs();
        $hasTabs = !empty($tabs);
        $groups = $form->getGroups();
    @endphp

    <div class="max-w-7xl mx-auto" x-data="{ currentTab: '{{ array_key_first($tabs) ?: 'default' }}' }">
        {{-- Page Header --}}
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ $model->exists() ? 'Edit' : 'Create' }} {{ class_basename($model) }}
            </h1>
        </div>

        {{-- Display all errors at top --}}
        <x-orbit::errors />

        {{-- Form --}}
        <form action="{{ $formAction }}" method="{{ $actualMethod }}" enctype="multipart/form-data" class="space-y-6">
            @csrf
            @if ($spoofMethod)
                @method($spoofMethod)
            @endif

            {{-- Tabs Navigation (if tabs are defined) --}}
            @if ($hasTabs)
                <div class="border-b border-gray-200 dark:border-gray-700">
                    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                        @foreach ($tabs as $tabKey => $tabLabel)
                            <button type="button" @click="currentTab = '{{ $tabKey }}'"
                                :class="currentTab === '{{ $tabKey }}' ?
                                    'border-primary-500 text-primary dark:text-primary-400' :
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
                                class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors">
                                {{ $tabLabel }}
                            </button>
                        @endforeach
                    </nav>
                </div>
            @endif

            {{-- Form Fields --}}
            <div class="bg-white dark:bg-gray-900 shadow rounded-lg">
                <div class="p-6 space-y-6">
                    @if ($hasTabs)
                        {{-- Render fields organized by tabs --}}
                        @foreach ($tabs as $tabKey => $tabLabel)
                            <div x-show="currentTab === '{{ $tabKey }}'" x-cloak>
                                @php
                                    $tabFields = array_filter(
                                        $fields,
                                        fn($field) => ($field->toArray()['tab'] ?? 'default') === $tabKey,
                                    );
                                @endphp

                                @if (!empty($tabFields))
                                    <div class="grid grid-cols-12 gap-6">
                                        @foreach ($tabFields as $field)
                                            <x-orbit::field :field="$field" :errors="$errors" :formData="$model->toArray()" />
                                        @endforeach
                                    </div>
                                @else
                                    <p class="text-gray-500 dark:text-gray-400">No fields in this tab.</p>
                                @endif
                            </div>
                        @endforeach
                    @else
                        {{-- Render all fields without tabs --}}
                        @if (!empty($fields))
                            <div class="grid grid-cols-12 gap-6">
                                @foreach ($fields as $field)
                                    <x-orbit::field :field="$field" :errors="$errors" :formData="$model->toArray()" />
                                @endforeach
                            </div>
                        @else
                            <p class="text-gray-500 dark:text-gray-400">No fields defined.</p>
                        @endif
                    @endif
                </div>
            </div>

            {{-- Form Actions --}}
            <div class="flex items-center justify-between bg-white dark:bg-gray-900 shadow rounded-lg p-6">
                <a href="{{ request()->header('referer', admin_url()) }}"
                    class="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Cancel
                </a>

                <div class="flex items-center gap-3">
                    @if (!$model->exists())
                        <button type="submit" name="status" value="draft"
                            class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                            Save as Draft
                        </button>
                    @endif

                    <button type="submit"
                        class="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                        {{ $form->getSubmitLabel() }}
                    </button>
                </div>
            </div>
        </form>
    </div>
@stop
