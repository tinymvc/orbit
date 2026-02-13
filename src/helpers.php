<?php

use Orbit\Models\Option;
use Orbit\Models\Post;
use Orbit\Services\Dashboard;
use Spark\Utils\Paginator;

if (!function_exists('dashboard')) {
    /**
     * Get the Orbit Dashboard instance
     *
     * @return Dashboard
     */
    function dashboard(): Dashboard
    {
        return app(Dashboard::class);
    }
}

if (!function_exists('add_menu')) {
    /**
     * Add a menu item to the Orbit dashboard
     *
     * @param string $slug Menu slug
     * @param string $title Menu title
     * @param callable|string|null $callback Callback or URL
     * @param string|null $icon Menu icon
     * @param int $position Menu position
     * @param string|null $parent Parent menu slug for submenu
     * @return bool
     */
    function add_menu(
        string $slug,
        string $title,
        callable|string|null $callback = null,
        null|string $icon = null,
        int $position = 10,
        null|string $parent = null
    ): bool {
        return dashboard()->addMenu($slug, $title, $callback, $icon, $position, $parent);
    }
}

if (!function_exists('clear_option_cache')) {
    /**
     * Clear specific option from the global options cache
     *
     * @param string|null $key Specific option key to clear, or null to clear all
     * @return void
     */
    function clear_option_cache(?string $key = null): void
    {
        global $options;

        if ($key === null) {
            $options = null;
        }

        $options = $options->filter(fn($opt) => $opt['option_key'] !== $key);
    }
}

if (!function_exists('get_option')) {
    /**
     * Get an option value (WordPress-like API)
     *
     * @param string $key Option name
     * @param mixed $default Default value if option doesn't exist
     * @return mixed Option value or default
     */
    function get_option(string $key, mixed $default = null): mixed
    {
        global $options;

        if (!isset($options)) {
            /** @var \Spark\Support\Collection $options */
            $options = Option::where('autoload', 1)->get();
        }

        $option = $options->firstWhere('option_key', $key);

        if ($option) {
            return $option->option_value;
        } elseif ($option === false) {
            return $default;
        }

        $option = Option::where('option_key', $key)->first();

        $options->put($key, $option);

        if (!$option) {
            return $default;
        }

        return $option->option_value;
    }
}

if (!function_exists('update_option')) {
    /**
     * Update an option value (WordPress-like API)
     *
     * @param string $key Option name
     * @param mixed $value Option value
     * @param bool $autoload Whether to autoload this option
     * @return bool
     */
    function update_option(string $key, mixed $value, bool $autoload = true): bool
    {
        $option = Option::createOrUpdate([
            'option_key' => $key,
            'option_value' => $value,
            'autoload' => $autoload,
        ], uniqueBy: ['option_key']);

        $updated = $option->wasChanged();

        $updated && clear_option_cache($key);

        return $updated;
    }
}

if (!function_exists('delete_option')) {
    /**
     * Delete an option (WordPress-like API)
     *
     * @param string $key Option name
     * @return bool
     */
    function delete_option(string $key): bool
    {
        $deleted = (bool) Option::where('option_key', $key)->delete();

        // Reset options cache if an option was deleted
        $deleted && clear_option_cache($key);

        return $deleted;
    }
}

if (!function_exists('get_post')) {
    /**
     * Get a post by ID (WordPress-like API)
     *
     * @param int $postId Post ID
     * @return Post|null
     */
    function get_post(int $postId): ?Post
    {
        return Post::find($postId);
    }
}

if (!function_exists('get_posts')) {
    /**
     * Get posts with optional filters (WordPress-like API)
     *
     * @param array $args Query arguments
     * @return \Spark\Utils\Paginator|array<Post>
     */
    function get_posts(array $args = []): array|Paginator
    {
        $query = Post::query();

        // Post type filter
        if (isset($args['post_type'])) {
            if (is_array($args['post_type'])) {
                $query->whereIn('type', $args['post_type']);
            } else {
                $query->where('type', $args['post_type']);
            }
        }

        // Status filter
        if (isset($args['post_status'])) {
            if (is_array($args['post_status'])) {
                $query->whereIn('status', $args['post_status']);
            } else {
                $query->where('status', $args['post_status']);
            }
        }

        // Author filter
        if (isset($args['author'])) {
            $query->where('author_id', $args['author']);
        }

        // Search filter
        if (isset($args['s'])) {
            $query->grouped(function ($q) use ($args) {
                $q->where('title', 'LIKE', '%' . $args['s'] . '%')
                    ->orWhere('excerpt', 'LIKE', '%' . $args['s'] . '%');
            });
        }

        // Add offset and limit
        if (isset($args['offset'], $args['posts_per_page'])) {
            $query->limit($args['offset'], $args['posts_per_page'] ?? null);
        }

        // Order
        if (isset($args['orderby'])) {
            $order = $args['order'] ?? 'DESC';
            $query->orderBy($args['orderby'], $order);
        } else {
            $query->orderDesc('created_at');
        }

        // Return all results if offset is set
        if (isset($args['offset'], $args['posts_per_page'])) {
            return $query->all();
        }

        return $query->paginate($args['posts_per_page'] ?? 10);
    }
}

if (!function_exists('insert_post')) {
    /**
     * Insert or update a post with meta support (WordPress-like API)
     *
     * @param array $data Post data (supports 'meta' key for post meta)
     * @return int|bool Post ID on success, false on failure
     */
    function insert_post(array $data): int|bool
    {
        try {
            // Update existing post
            if (isset($data['id']) && $data['id']) {
                $post = Post::find($data['id']);
                if ($post) {
                    $post->fill($data);
                    $post->save();
                    $postId = $post['id'] ?? false;
                } else {
                    return false;
                }
            } else {
                // Create new post
                $post = Post::create($data);
                $postId = $post['id'] ?? false;

                if (!$postId) {
                    return false;
                }
            }

            return $postId;
        } catch (\Exception $e) {
            return false;
        }
    }
}

if (!function_exists('delete_post')) {
    /**
     * Delete a post (WordPress-like API)
     *
     * @param int $postId Post ID
     * @param bool $forceDelete Whether to bypass trash and force deletion
     * @return bool
     */
    function delete_post(int $postId, bool $forceDelete = false): bool
    {
        $post = Post::find($postId);

        if (!$post) {
            return false;
        }

        if ($forceDelete) {
            return $post->remove();
        }

        // Move to trash
        $post->set('status', 'trash');
        return (bool) $post->save();
    }
}

if (!function_exists('admin_url')) {
    /**
     * Get the admin URL for the Orbit dashboard
     * 
     * @param string $path Optional path to append
     * @param array $params Optional query parameters
     * @return string The absolute url
     */
    function admin_url(string $path = '', array $params = []): string
    {
        $url = route_url('orbit.dashboard');

        if ($path) {
            $url .= '/' . trim($path, '/');
        }

        if (!empty($params)) {
            $url .= (str_contains($url, '?') ? '&' : '?') . http_build_query($params);
        }

        return rtrim($url, '/');
    }
}

if (!function_exists('get_gravatar')) {
    /**
     * Get either a Gravatar URL or complete image tag for a specified email address.
     *
     * @param string $email The email address
     * @param int $size Size in pixels, defaults to 64px [ 1 - 2048 ]
     * @param string $default_image_type Default imageset to use [ 404 | mp | identicon | monsterid | wavatar ]
     * @param bool $force_default Force default image always. By default false.
     * @param string $rating Maximum rating (inclusive) [ g | pg | r | x ]
     *
     * @return string containing either just a URL or a complete image tag
     * @source https://gravatar.com/site/implement/images/php/
     */
    function get_gravatar($email, $size = 64, $default_image_type = 'mp', $force_default = false, $rating = 'g'): string
    {
        // Prepare parameters.
        $params = [
            's' => htmlentities($size),
            'd' => htmlentities($default_image_type),
            'r' => htmlentities($rating),
        ];
        if ($force_default) {
            $params['f'] = 'y';
        }

        // Generate url.
        $base_url = 'https://www.gravatar.com/avatar';
        $hash = hash('sha256', strtolower(trim($email)));
        $query = http_build_query($params);
        $url = sprintf('%s/%s?%s', $base_url, $hash, $query);

        return $url;
    }
}

if (!function_exists('dashboard_prefix')) {
    /**
     * Get the dashboard route prefix from environment or default
     *
     * @return string
     */
    function dashboard_prefix(): string
    {
        return env('orbit.route_prefix', 'admin');
    }
}

if (!function_exists('orbit_path')) {
    /**
     * Get the absolute path to the Orbit directory
     *
     * @param string $path Optional relative path within the Orbit directory
     * @return string Absolute path to the specified location
     */
    function orbit_path(string $path = ''): string
    {
        return dir_path(
            trim(__DIR__ . '/' . trim($path, '/'), '/')
        );
    }
}
