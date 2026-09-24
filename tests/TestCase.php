<?php

namespace Tests;

use Spark\Foundation\Application;

/** Base test case for all tests. */
abstract class TestCase extends \Spark\Testing\ApplicationTestCase
{
    // Tinycore 3.3.1 does not refresh request-bound singletons between simulated requests.
    protected function request(string $method, string $uri, array $data = [], array $headers = [], bool $json = false): \Spark\Testing\TestResponse
    {
        $this->app->forgetInstance(\Spark\Http\Request::class);
        $this->app->forgetInstance(\Inertia\Inertia::class);
        return parent::request($method, $uri, $data, $headers, $json);
    }

    protected function createApplication(): Application
    {
        \Inertia\Inertia::flushShared();

        /** @var Application $app */
        $app = require dirname(__DIR__) . '/bootstrap/app.php';
        $app->mergeConfig(require __DIR__ . '/config.php');

        return $app;
    }
}
