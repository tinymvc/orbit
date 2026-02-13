<x-orbit::html>
    <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md">

            <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="text-2xl font-semibold leading-none tracking-tight">Sign In</h3>
                <p class="text-sm text-muted-foreground">Enter your credentials to access dashboard</p>
            </div>

            <div class="p-6 pt-0 space-y-4">
                <form action="{{ route('orbit.login') }}" method="post" class="space-y-4">
                    @csrf
                    <x-orbit::errors :fireline="true" />

                    <x-orbit::input label="Email Address" id="email" name="email" type="email"
                        placeholder="you@example.com" />

                    <x-orbit::input label="Password" id="password" name="password" type="password"
                        placeholder="******" />

                    <x-orbit::button type="submit" class="w-full">Sign In</x-orbit::button>
                </form>
            </div>
        </div>
    </div>
</x-orbit::html>
