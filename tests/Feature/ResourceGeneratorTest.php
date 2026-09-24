<?php

namespace Tests\Feature;

use App\Services\Bread\Commands\CreateResourceStub;
use Tests\Fixtures\UploadResource;
use Tests\TestCase;

final class ResourceGeneratorTest extends TestCase
{
    public function test_generator_uses_relocated_stub_and_singular_model(): void
    {
        $namespace = 'GeneratorTest' . bin2hex(random_bytes(5));
        $folder = root_dir('app/Http/Resources/' . $namespace);
        $file = "$folder/PostsResource.php";
        $level = ob_get_level();
        ob_start();
        try {
            (new CreateResourceStub())(['_args' => ["$namespace/Post"]]);
            $generated = file_get_contents($file);
            $this->assertTrue(str_contains($generated, 'use App\\Models\\Post;'));
            $this->assertTrue(str_contains($generated, 'use App\\Services\\Bread\\Resource;'));
            $this->assertTrue(str_contains($generated, "namespace App\\Http\\Resources\\$namespace;"));
            $this->assertFalse(str_contains($generated, '{{'));
            require $file;
            $class = "App\\Http\\Resources\\$namespace\\PostsResource";
            $this->assertSame('Post', $class::getName());
            $this->assertSame('/admin/posts', $class::getUrl());
            $this->assertSame('name', $class::toSchema()['fields'][0]['name']);
        } finally {
            while (ob_get_level() > $level) { ob_end_clean(); }
            if (is_file($file)) { unlink($file); }
            if (is_dir($folder)) { rmdir($folder); }
        }
    }

    public function test_resource_defaults_respect_subclass_properties(): void
    {
        $this->assertSame('Documents', UploadResource::getTitle());
        $this->assertSame('/files/documents', UploadResource::getUrl());
    }
}
