@extends('orbit::layout.master')

@section('content')

    {{-- BREAD Table View --}}

    @php
        $hasFilters = !empty($filters);
        $hasBulkActions = !empty($bulkActions);
        $hasActions = !empty($actions);
        $searchTerm = request()->input('search', '');
        $currentSort = request()->input('sort', '');
        $currentDirection = request()->input('direction', 'desc');
    @endphp

    <div class="max-w-7xl mx-auto" x-data="tableData(@json($data->pluck('id')), '{{ request()->getPath() }}')">
        {{-- Page Header --}}
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ str(class_basename($table->getModel()))->headline()->plural() }}
            </h1>

            {{-- Create Button --}}
            <a href="{{ request()->getPath() }}/create"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add New
            </a>
        </div>

        {{-- Search & Filters Bar --}}
        <div class="bg-white dark:bg-gray-900 shadow rounded-lg mb-4">
            <div class="p-4">
                <form method="GET" class="flex flex-col sm:flex-row gap-4">
                    {{-- Search --}}
                    @if ($table->isSearchable())
                        <div class="flex-1">
                            <label for="search" class="sr-only">Search</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input type="text" name="search" id="search" value="{{ $searchTerm }}"
                                    placeholder="{{ $table->getSearchPlaceholder() }}"
                                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            </div>
                        </div>
                    @endif

                    {{-- Filters --}}
                    @if ($hasFilters)
                        @foreach ($filters as $filterName => $filter)
                            @if ($filter['type'] ?? 'select' === 'select')
                                <div class="sm:w-48">
                                    <label for="filter_{{ $filterName }}" class="sr-only">{{ $filter['label'] }}</label>
                                    <select name="{{ $filterName }}" id="filter_{{ $filterName }}"
                                        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                        <option value="">{{ $filter['label'] }}</option>
                                        @foreach ($filter['options'] as $value => $label)
                                            <option value="{{ $value }}" @selected(request()->input($filterName) == $value)>
                                                {{ $label }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            @endif
                        @endforeach
                    @endif

                    {{-- Filter Button --}}
                    <button type="submit"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Filter
                    </button>
                </form>
            </div>
        </div>

        {{-- Bulk Actions Bar --}}
        @if ($hasBulkActions)
            <div x-show="selectedRows.length > 0" x-cloak
                class="bg-primary-50 dark:bg-primary-900/20 shadow rounded-lg p-4 mb-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-primary-900 dark:text-primary-100">
                        <span x-text="selectedRows.length"></span> item(s) selected
                    </span>

                    <div class="flex gap-2">
                        @foreach ($bulkActions as $actionName => $action)
                            <button type="button" @click="performBulkAction('{{ $actionName }}')"
                                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                {{ $action['label'] }}
                            </button>
                        @endforeach
                    </div>
                </div>
            </div>
        @endif

        {{-- Table --}}
        <div class="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            {{-- Bulk Select Checkbox --}}
                            @if ($hasBulkActions)
                                <th scope="col" class="px-6 py-3 w-12">
                                    <input type="checkbox" @change="toggleAll($event)"
                                        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                </th>
                            @endif

                            {{-- Column Headers --}}
                            @foreach ($columns as $column)
                                @php
                                    $columnName = $column->getName();
                                    $isSortable = $column->isSortable();
                                    $isSorted = $currentSort === $columnName;
                                    $nextDirection = $isSorted && $currentDirection === 'asc' ? 'desc' : 'asc';
                                    $align = $column->getAlign();
                                    $alignClass = match ($align) {
                                        'center' => 'text-center',
                                        'right' => 'text-right',
                                        default => 'text-left',
                                    };
                                @endphp

                                <th scope="col"
                                    class="px-6 py-3 {{ $alignClass }} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                    style="{{ $column->getWidth() ? 'width: ' . $column->getWidth() : '' }}">
                                    @if ($isSortable)
                                        <a href="?{{ http_build_query(array_merge(request()->all(), ['sort' => $columnName, 'direction' => $nextDirection])) }}"
                                            class="group inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
                                            {{ $column->getLabel() }}
                                            @if ($isSorted)
                                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    @if ($currentDirection === 'asc')
                                                        <path fill-rule="evenodd"
                                                            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                                            clip-rule="evenodd" />
                                                    @else
                                                        <path fill-rule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clip-rule="evenodd" />
                                                    @endif
                                                </svg>
                                            @endif
                                        </a>
                                    @else
                                        {{ $column->getLabel() }}
                                    @endif
                                </th>
                            @endforeach

                            {{-- Actions Column --}}
                            @if ($hasActions)
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            @endif
                        </tr>
                    </thead>

                    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        @foreach ($data as $index => $record)
                            <tr
                                class="{{ $table->isHoverable() ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : '' }} {{ $table->isStriped() && $index % 2 ? 'bg-gray-50 dark:bg-gray-800/50' : '' }}">
                                {{-- Bulk Select Checkbox --}}
                                @if ($hasBulkActions)
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <input type="checkbox" :value="{{ $record->id }}"
                                            @change="toggleRow({{ $record->id }})"
                                            :checked="selectedRows.includes({{ $record->id }})"
                                            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                    </td>
                                @endif

                                {{-- Data Columns --}}
                                @foreach ($columns as $column)
                                    @php
                                        $columnName = $column->getName();
                                        $rawValue = $record->get($columnName);
                                        $value = $column->formatValue($rawValue, $record);
                                        $type = $column->getType();
                                        $align = $column->getAlign();
                                        $alignClass = match ($align) {
                                            'center' => 'text-center',
                                            'right' => 'text-right',
                                            default => 'text-left',
                                        };
                                    @endphp

                                    <td
                                        class="px-6 py-4 whitespace-nowrap {{ $alignClass }} text-sm text-gray-900 dark:text-gray-100">
                                        @switch($type)
                                            @case('badge')
                                                <span
                                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $column->getBadgeColor($rawValue) }} text-white">
                                                    {{ $value }}
                                                </span>
                                            @break

                                            @case('image')
                                                @if ($value)
                                                    <img src="{{ $value }}" alt="{{ $columnName }}"
                                                        class="h-10 w-10 rounded-full object-cover">
                                                @else
                                                    <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                                @endif
                                            @break

                                            @case('boolean')
                                                @if ($value)
                                                    <svg class="h-5 w-5 text-green-500 mx-auto" fill="currentColor"
                                                        viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                @else
                                                    <svg class="h-5 w-5 text-red-500 mx-auto" fill="currentColor"
                                                        viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                @endif
                                            @break

                                            @default
                                                {!! $value !!}
                                        @endswitch
                                    </td>
                                @endforeach

                                {{-- Actions --}}
                                @if ($hasActions)
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div class="flex items-center justify-end gap-2">
                                            @foreach ($actions as $actionName => $action)
                                                @php
                                                    $url = $table->getActionUrl($actionName, $record);
                                                    $confirmMessage = $action['confirm'] ?? null;
                                                @endphp

                                                <a href="{{ $url }}"
                                                    @if ($confirmMessage) onclick="return confirm('{{ $confirmMessage }}')" @endif
                                                    class="text-{{ $action['color'] ?? 'primary' }}-600 hover:text-{{ $action['color'] ?? 'primary' }}-900 dark:text-{{ $action['color'] ?? 'primary' }}-400 dark:hover:text-{{ $action['color'] ?? 'primary' }}-300">
                                                    {{ $action['label'] }}
                                                </a>
                                            @endforeach
                                        </div>
                                    </td>
                                @endif
                            </tr>
                        @endforeach
                        @if ($data->isEmpty())
                            <tr>
                                <td colspan="{{ count($columns) + ($hasBulkActions ? 1 : 0) + ($hasActions ? 1 : 0) }}"
                                    class="px-6 py-12 text-center">
                                    <div class="text-gray-500 dark:text-gray-400">
                                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p class="mt-2 text-sm">{{ $table->getEmptyStateMessage() }}</p>
                                    </div>
                                </td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>

            {{-- Pagination --}}
            @if (false)
                <div class="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                    <div class="flex items-center justify-between">
                        <div class="flex-1 flex justify-between sm:hidden">
                            @if ($data->previousPageUrl())
                                <a href="{{ $data->previousPageUrl() }}"
                                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    Previous
                                </a>
                            @endif

                            @if ($data->nextPageUrl())
                                <a href="{{ $data->nextPageUrl() }}"
                                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    Next
                                </a>
                            @endif
                        </div>

                        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p class="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span class="font-medium">{{ $data->firstItem() }}</span> to <span
                                        class="font-medium">{{ $data->lastItem() }}</span> of <span
                                        class="font-medium">{{ $data->total() }}</span> results
                                </p>
                            </div>

                            <div>
                                {{ $data->links() }}
                            </div>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>
@stop
