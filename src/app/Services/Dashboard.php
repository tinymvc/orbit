<?php

namespace Orbit\Services;

use Spark\Support\Collection;

class Dashboard
{
    /** @var Collection The menu items */
    public Collection $menu;

    public function __construct()
    {
        $this->menu = new Collection();
    }

    public function init(): void
    {
        $this->registerMenusItems();
    }

    public function findMenuItemBySlug(string $slug): ?array
    {
        $slug = str($slug)->trim('/')->lower()->toString();

        // Search top-level menu items
        foreach ($this->menu as $menuItem) {
            if ($menuItem['slug'] === $slug) {
                return $menuItem;
            }

            // Search in children
            foreach ($menuItem['children'] as $childItem) {
                if ($childItem['slug'] === $slug) {
                    return $childItem;
                }
            }
        }

        return null; // Not found
    }

    public function addMenu(
        string $slug,
        string $title,
        string|callable|array|null $callback = null,
        string|null $icon = null,
        int $position = 10,
        string|null $parent = null
    ): bool {
        $slug = str($slug)->trim('/')->lower()->toString();

        $menuItem = [
            'slug' => $slug,
            'title' => $title,
            'callback' => $callback,
            'icon' => $icon ?? 'dashicons-admin-generic',
            'position' => $position,
            'children' => new Collection(),
        ];

        if ($parent) {
            // Add as submenu
            $parent = str($parent)->trim('/')->lower()->toString();
            $parentMenu = $this->menu->firstWhere('slug', $parent);
            if ($parentMenu) {
                unset($menuItem['children']); // No need for children in submenu items
                $menuItem['parent'] = $parent; // Set parent slug
                $parentMenu['children']->put($slug, $menuItem); // Add to parent's children
            }
        } else {
            // Add as top-level menu
            $this->menu->put($slug, $menuItem);
        }

        return true;
    }

    public function getMenu(): Collection
    {
        return $this->menu->sortBy('position');
    }

    protected function registerMenusItems(): void
    {
        $this->addMenu('/', 'Dashboard', null, 'dashicons-dashboard', 1);
    }
}