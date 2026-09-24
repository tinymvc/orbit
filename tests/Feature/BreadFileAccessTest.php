<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Services\Bread\Form\FileUpload;
use App\Services\Bread\ResourceController;
use Spark\Facades\Disk;
use Tests\DatabaseTestCase;
use Tests\Fixtures\UploadResource;

final class BreadFileAccessTest extends DatabaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        UploadResource::$disk = 'local';
        ResourceController::routes(UploadResource::class)->prefix('files')->middleware('auth');
    }

    protected function tearDown(): void
    {
        UploadResource::$disk = 'public';
        parent::tearDown();
    }

    public function test_private_files_are_served_only_for_keys_attached_to_a_record(): void
    {
        $user = $this->signIn();
        Disk::disk('local')->put('posts/private.txt', 'private contents');
        Disk::disk('local')->put('posts/other.txt', 'unrelated contents');
        $post = Post::create(['user_id' => $user->id, 'title' => 'Private', 'slug' => 'private', 'thumbnail' => 'posts/private.txt']);
        $url = '/files/documents/' . $post->id . '/file?field=thumbnail&path=posts%2Fprivate.txt';
        $this->get($url)->assertOk()->assertContent('private contents')->assertHeader('Cache-Control', 'private, no-store')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
        foreach (['posts/other.txt', '../private.txt', 'https://example.test/file'] as $key) {
            $this->get('/files/documents/' . $post->id . '/file?field=thumbnail&path=' . urlencode($key))->assertNotFound();
        }
        $this->get('/files/documents/' . $post->id . '/file?field=password&path=posts%2Fprivate.txt')->assertNotFound();
        $data = UploadResource::recordWithFileUrls($post);
        $this->assertSame('posts/private.txt', $data['thumbnail']);
        $this->assertSame($url, $data['__fileUrls']['thumbnail']['posts/private.txt']);
        Disk::disk('public')->put('posts/private.txt', 'public copy');
        UploadResource::deleteRecordFiles($post);
        $this->assertFalse(Disk::disk('local')->exists('posts/private.txt'));
        $this->assertTrue(Disk::disk('public')->exists('posts/private.txt'));
    }

    public function test_resource_browse_permission_protects_previews(): void
    {
        $user = $this->signIn(['users.browse']);
        Disk::disk('public')->put('posts/secret.txt', 'secret');
        $post = Post::create(['user_id' => $user->id, 'title' => 'Secret', 'slug' => 'secret', 'thumbnail' => 'posts/secret.txt']);
        $this->get('/admin/posts/' . $post->id . '/file?field=thumbnail&path=posts%2Fsecret.txt')->assertForbidden();
    }

    public function test_s3_previews_use_short_lived_signed_urls_and_do_not_expose_credentials(): void
    {
        $user = $this->signIn();
        $this->app->mergeConfig(['disk' => ['disks' => ['s3' => [
            'driver' => 's3', 'key' => 'test-key', 'secret' => 'never-send-this-secret', 'region' => 'us-east-1',
            'bucket' => 'test-bucket', 'endpoint' => 'https://s3.example.test', 'use_path_style_endpoint' => true,
        ]]]]);
        UploadResource::$disk = 's3';
        $post = Post::create(['user_id' => $user->id, 'title' => 'S3', 'slug' => 's3', 'thumbnail' => 'posts/report.txt']);
        $response = $this->get('/files/documents/' . $post->id . '/file?field=thumbnail&path=posts%2Freport.txt')->assertStatus(302);
        $location = $response->response->getHeaders()['Location'] ?? $response->response->getHeaders()['location'] ?? '';
        $this->assertTrue(str_contains($location, 'X-Amz-Expires=300'));
        $this->assertTrue(str_contains($location, 'X-Amz-Signature='));
        $this->assertFalse(str_contains($location, 'never-send-this-secret'));
    }

    public function test_disk_default_is_selectable_and_external_files_are_not_deleted(): void
    {
        $this->assertSame('public', FileUpload::make('file')->getDisk());
        UploadResource::$disk = null;
        Disk::put('posts/new.txt', 'new');
        UploadResource::cleanUpFileChanges(['thumbnail' => 'posts/new.txt'], saved: false);
        $this->assertFalse(Disk::exists('posts/new.txt'));
        UploadResource::deleteRecordFiles((new Post())->fill(['thumbnail' => 'https://example.test/external.png']));
        $this->assertSame([], Disk::allFiles());
    }
}
