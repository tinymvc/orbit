<?php

namespace App\Services\Bread;

use Spark\Exceptions\Utils\UploaderException;

class UploadException extends UploaderException
{
    public function __construct(public readonly string $field, \Throwable $previous)
    {
        parent::__construct(
            $previous instanceof UploaderException
                ? $previous->getMessage()
                : 'Unable to store the file. Please try again.',
            previous: $previous
        );
    }
}
