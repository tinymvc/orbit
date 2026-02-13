<div class="flex h-16 items-center justify-between border-b bg-gray-50 dark:bg-background px-6">
    <div class="flex items-center space-x-2">
        <a class="transition-colors text-foreground/65 hover:text-foreground/85" href="{{ admin_url() }}"
            data-discover="true">
            <span class="dashicons text-2xl dashicons-admin-home"></span>
        </a>
        <div x-cloak x-show="currentMenu() && currentMenu().slug.trim('/') != ''"
            class="flex items-center space-x-2 text-sm text-border">
            <span>/</span>
            <span x-show="currentMenu().children?.title">
                <a :href="`{{ admin_url() }}/${currentMenu().slug}`"
                    class="text-foreground/65 hover:text-foreground/85" x-text="currentMenu().title || ''"></a>
                <span>/</span>
                <span class="text-foreground font-medium" x-text="currentMenu().children.title || ''"></span>
            </span>
            <span x-show="!currentMenu().children?.title">
                <span class="text-foreground font-medium" x-text="currentMenu().title || ''"></span>
            </span>
        </div>
    </div>
    <div class="flex items-center gap-4">
        <button
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-10 w-10 rounded-full"
            type="button">
            <span class="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <img :src="user().avatar" alt="">
            </span>
        </button>
    </div>
</div>
