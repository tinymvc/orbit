@props(['type' => 'text', 'label' => null])
<div class="space-y-2">
    @isset($label)
        <label class="text-sm font-medium leading-none" for="{{ $attributes->get('id') }}">{{ $label }}</label>
    @endisset
    <input
        {{ $attributes->merge([
            'type' => $type,
            'class' =>
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        ]) }}>
</div>
