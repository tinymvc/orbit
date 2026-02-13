<!DOCTYPE html>
<html lang="en" class="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Dashboard')</title>
    <style>
        [x-cloak] {
            display: none !important;
        }
    </style>
    <link rel="stylesheet" href="{{ asset_url('/orbit/fonts/inter/inter.css') }}">
    <link rel="stylesheet" href="{{ asset_url('/orbit/fonts/dashicons/dashicons.css') }}">
    @vite('app.js')
</head>

<body class="antialiased font-sans">

    {!! $slot !!}

</body>

</html>
