<?php

use App\Models\Category;
use App\Models\Post;

return new class {
    public function up(): void
    {
        Category::insert([
            [
                'name' => 'Tech',
                'slug' => 'tech'
            ],
            [
                'name' => 'Lifestyle',
                'slug' => 'lifestyle'
            ],
            [
                'name' => 'Travel',
                'slug' => 'travel'
            ],
            [
                'name' => 'Food',
                'slug' => 'food'
            ],
            [
                'name' => 'Education',
                'slug' => 'education'
            ],
        ]);

        $image = fn() => 'https://picsum.photos/200/300.webp?version=' . uniqid(more_entropy: true);

        Post::insert([
            [
                'user_id' => 1,
                'title' => 'The Future of AI: Trends and Predictions',
                'slug' => 'the-future-of-ai-trends-and-predictions',
                'thumbnail' => $image(),
                'excerpt' => 'About the future of AI and its impact on various industries.',
                'content' => 'Artificial Intelligence (AI) has been a transformative force in various industries, from healthcare to finance. As we look ahead, several trends and predictions are shaping the future of AI:',
                'status' => Post::STATUS_PUBLISHED,
                'published_at' => now()->subDays(rand(1, 30)),
                'scheduled_at' => null,
            ],
            [
                'user_id' => 1,
                'title' => '10 Tips for a Healthy Lifestyle',
                'slug' => '10-tips-for-a-healthy-lifestyle',
                'thumbnail' => $image(),
                'excerpt' => 'Discover 10 essential tips to maintain a healthy lifestyle and improve your overall well-being.',
                'content' => 'Maintaining a healthy lifestyle is essential for overall well-being. Here are 10 tips to help you lead a healthier life.',
                'status' => Post::STATUS_SCHEDULED,
                'published_at' => null,
                'scheduled_at' => now()->addDays(rand(1, 30)),
            ],
            [
                'user_id' => 1,
                'title' => 'Top Travel Destinations for 2024',
                'slug' => 'top-travel-destinations-for-2024',
                'thumbnail' => $image(),
                'excerpt' => 'Looking for your next travel adventure? Check out our list of top travel destinations for 2024.',
                'content' => 'Travel is a great way to explore new cultures and create unforgettable memories. Here are the top travel destinations for 2024 that you should consider for your next adventure.',
                'status' => Post::STATUS_PUBLISHED,
                'published_at' => now()->subDays(rand(1, 30)),
                'scheduled_at' => null,
            ],
            [
                'user_id' => 1,
                'title' => 'Delicious and Easy-to-Make Recipes',
                'slug' => 'delicious-and-easy-to-make-recipes',
                'thumbnail' => $image(),
                'excerpt' => 'Discover a variety of delicious and easy-to-make recipes that will satisfy your taste buds.',
                'content' => 'The kitchen is a place of creativity and joy. Here are some delicious and easy-to-make recipes that will satisfy your taste buds and impress your friends and family.',
                'status' => Post::STATUS_PUBLISHED,
                'published_at' => now()->subDays(rand(1, 30)),
                'scheduled_at' => null,
            ],
            [
                'user_id' => 1,
                'title' => 'The Importance of Education in the Digital Age',
                'slug' => 'the-importance-of-education-in-the-digital-age',
                'thumbnail' => $image(),
                'excerpt' => 'Education is crucial in the digital age. Learn about the importance of education and how it can shape our future.',
                'content' => 'Digital technology has transformed the way we live and work, making education more important than ever. In this article, we explore the importance of education in the digital age and how it can shape our future.',
                'status' => Post::STATUS_ARCHIVED,
                'published_at' => now()->subDays(rand(1, 30)),
                'scheduled_at' => null,
            ]
        ]);

        $categoryIds = collect(
            Category::pluck('id')
        );
        $postIds = Post::pluck('id');

        foreach ($postIds as $postId) {
            $assignedCategoryIds = $categoryIds->random(rand(1, 3))->toArray();

            /** @var Post $post */
            $post = Post::find($postId);
            $post->categories()->attach($assignedCategoryIds);
        }
    }

    public function down(): void
    {
        Category::delete('1=1');
        Post::delete('1=1');
    }
};