@props([
    'name' => null,
    'value' => null,
    'type' => 'file',
])
<div @if ($type === 'image') x-data="fileUpload('{{ $name }}', '{{ $value }}')" @endif
    class="space-y-2">
    <input type="file" name="{{ $name }}" id="{{ $name }}" x-ref="fileInput"
        @if ($type === 'image') @change="handleFileSelect($event)" @endif {!! $field->getAttributesString() !!}
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-800 dark:file:text-gray-300">

    {{-- Preview for new upload --}}
    @if ($type === 'image')
        <div x-show="preview" class="mt-2">
            <img :src="preview" alt="Preview" class="h-32 w-auto rounded border">
        </div>
    @endif
</div>
