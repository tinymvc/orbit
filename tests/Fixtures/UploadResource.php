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

    public static ?string $disk = 'public';

    public static function fields(): array
    {
        return [
            FileUpload::make('image')->disk(static::$disk)->uploadTo('posts')->acceptedTypes(['png'])->compress(80)->resize(4, 4),
            FileUpload::make('thumbnail')->disk(static::$disk)->uploadTo('posts')->acceptedTypes(['txt'])->maxFileSize(1),
            FileUpload::make('attachments')->disk(static::$disk)->uploadTo('posts')->acceptedTypes(['txt'])->maxFileSize(1)->multiple(),
        ];
    }

    public static function columns(): array
    {
        return [];
    }
}
