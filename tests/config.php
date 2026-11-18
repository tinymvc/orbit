<?php

// Each feature test receives its own temporary directory from Spark\Testing\ApplicationTestCase.
$storage = env('TEST_STORAGE_PATH');
if (!$storage) {
    throw new LogicException('Use the application TestCase to boot feature tests.');
}

return [
    'app' => [
        'debug' => false,
        'env' => 'testing',
        'key' => str_repeat('a', 32),
        'timezone' => 'UTC',
        'url' => 'http://localhost:8080',
        'storage_dir' => $storage,
        'temp_dir' => "$storage/temp",
        'upload_dir' => "$storage/uploads",
    ],
    'database' => [
        'default' => 'sqlite',
        'connections' => ['sqlite' => ['driver' => 'sqlite', 'file' => ':memory:']],
    ],
    'storage' => [
        'default' => 'local',
        'disks' => [
            'local' => ['root' => "$storage/app/private"],
            'public' => ['root' => "$storage/app/public"],
        ],
    ],
    'mail' => ['transport' => 'log'],
    'cache' => [
        'default' => 'file',
        'connections' => ['file' => ['path' => "$storage/cache", 'lock_path' => "$storage/locks"]],
    ],
    'queue' => [
        'default' => 'file',
        'connections' => ['file' => ['path' => "$storage/queue"]],
    ],
    'session' => [
        'default' => 'file',
        'connections' => ['file' => ['path' => "$storage/sessions"]],
    ],
];
