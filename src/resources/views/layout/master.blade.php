@unless (request()->isFirelineRequest())
    <x-orbit::html>
        <div x-data="app(@json([
            'menu' => dashboard()->getMenu()->map(
                    fn($item) => [
                        'title' => $item['title'],
                        'icon' => $item['icon'],
                        'slug' => $item['slug'],
                        'children' => collect($item['children'] ?? [])->map(
                                fn($child) => [
                                    'title' => $child['title'],
                                    'icon' => $child['icon'],
                                    'slug' => $child['slug'],
                                ])->values(),
                    ])->values(),
            'prefix' => dashboard_prefix(),
            'user' => user()->toArray(),
        ]))" class="flex h-screen overflow-hidden">

            @include('orbit::layout.sidebar')

            <div class="flex flex-1 flex-col overflow-hidden">
                @include('orbit::layout.header')

                <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-background p-6">
                    <div id="root">
                        <div class="space-y-8">@yield('content')</div>
                    </div>
                </main>

            </div>

        </div>
    </x-orbit::html>
@else
    <div class="space-y-8">@yield('content')</div>
@endunless
