<?php

if (!function_exists('get_gravatar_url')) {
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
    function get_gravatar_url($email, $size = 64, $default_image_type = 'mp', $force_default = false, $rating = 'g')
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