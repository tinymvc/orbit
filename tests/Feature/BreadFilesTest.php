<?php

namespace Tests\Feature;

use App\Models\Post;
use Spark\Http\Request;
use Tests\DatabaseTestCase;
use Tests\Fixtures\UploadResource;

final class BreadFilesTest extends DatabaseTestCase
{
    public function test_omitted_file_fields_preserve_existing_files(): void
    {
        disk('public')->put('posts/old.txt', 'old');
        $record = (new Post())->fill(['thumbnail' => 'posts/old.txt', 'attachments' => ['posts/old.txt']]);
        $this->assertSame([], UploadResource::processFileUploads(new Request(), $record));
        $this->assertTrue(disk('public')->exists('posts/old.txt'));
    }

    public function test_file_removal_is_delayed_until_save_and_cannot_adopt_foreign_paths(): void
    {
        disk('public')->put('posts/old.txt', 'old');
        disk('public')->put('posts/foreign.txt', 'foreign');
        $record = (new Post())->fill(['thumbnail' => 'posts/old.txt', 'attachments' => ['posts/old.txt']]);
        $request = new Request();
        $request->mergePostParams(['thumbnail' => '', 'attachments' => ['posts/foreign.txt']]);
        $changes = UploadResource::processFileUploads($request, $record);
        $this->assertSame(['thumbnail' => null, 'attachments' => []], $changes);
        $this->assertTrue(disk('public')->exists('posts/old.txt'));
        UploadResource::cleanUpFileChanges($changes, $record);
        $this->assertFalse(disk('public')->exists('posts/old.txt'));
        $this->assertTrue(disk('public')->exists('posts/foreign.txt'));
    }

    public function test_failed_save_cleanup_only_deletes_new_files(): void
    {
        foreach (['old', 'new'] as $name) {
            disk('public')->put("posts/$name.txt", $name);
        }
        $record = (new Post())->fill(['attachments' => ['posts/old.txt']]);
        UploadResource::cleanUpFileChanges(['attachments' => ['posts/old.txt', 'posts/new.txt']], $record, saved: false);
        $this->assertTrue(disk('public')->exists('posts/old.txt'));
        $this->assertFalse(disk('public')->exists('posts/new.txt'));
    }

    public function test_invalid_update_cannot_remove_an_existing_thumbnail(): void
    {
        $user = $this->signIn();
        disk('public')->put('posts/old.txt', 'old');
        $post = Post::create(['user_id' => $user->id, 'title' => 'Original', 'slug' => 'original',
            'excerpt' => 'Summary', 'content' => 'Body', 'thumbnail' => 'posts/old.txt']);
        $this->putJson('/admin/posts/' . $post->id, ['title' => '', 'thumbnail' => ''])
            ->assertUnprocessable();
        $this->assertTrue(disk('public')->exists('posts/old.txt'));
        $this->assertDatabaseHas('posts', ['id' => $post->id, 'thumbnail' => 'posts/old.txt']);
        $this->delete('/admin/posts/' . $post->id)->assertStatus(303);
        $this->assertFalse(disk('public')->exists('posts/old.txt'));
    }
}
