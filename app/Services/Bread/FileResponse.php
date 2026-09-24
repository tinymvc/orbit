<?php

namespace App\Services\Bread;

use Spark\Foundation\Application;
use Spark\Http\Response;

/** Stream local previews/downloads without buffering large uploads in memory. */
final class FileResponse extends Response
{
    public function __construct(private string $path, array $headers)
    {
        parent::__construct('', 200, $headers);
    }

    public function send(): void
    {
        if (Application::$app->isTesting()) parent::send();
        $this->file($this->path, $this->getHeaders());
    }

    public function getContent(): string
    {
        return (string) file_get_contents($this->path);
    }
}
