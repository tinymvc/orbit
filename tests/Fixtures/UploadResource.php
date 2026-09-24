<?php

namespace Tests\Fixtures;

use App\Models\Post;
use App\Services\Bread\Form\FileUpload;
use App\Services\Bread\Resource;

class UploadResource extends Resource
{
    protected static string $model = Post::class;
    protected static string $name = 'Document';
    protected static string $slug = 'documents';
    protected static string $urlPrefix = '/files/';

    public static function fields(): array
    {
        return [
            FileUpload::make('thumbnail')->uploadTo('posts')->acceptedTypes(['txt'])->maxFileSize(1),
            FileUpload::make('attachments')->uploadTo('posts')->acceptedTypes(['txt'])->maxFileSize(1)->multiple(),
        ];
    }

    public static function columns(): array
    {
        return [];
    }
}
