<?php

namespace App\Services\Bread;

use Spark\Exceptions\Utils\UploaderUtilException;

class UploadException extends UploaderUtilException
{
    public function __construct(public readonly string $field, \Throwable $previous)
    {
        parent::__construct($previous instanceof UploaderUtilException
            ? $previous->getMessage() : 'Unable to store the file. Please try again.', previous: $previous);
    }
}
