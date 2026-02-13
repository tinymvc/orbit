@props(['type'])
@php
    $type ??= $attributes->has('href') ? 'a' : 'button';
    if ($type !== 'a') {
        $type = 'button';
    }
@endphp

<{{ $type }}
    {{ $attributes->merge([
        'class' =>
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2',
    ]) }}>
    {!! $slot !!}</{{ $type }}>
