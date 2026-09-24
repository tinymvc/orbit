<?php

// Only run via the isolated multipart test server, never as an application route.
$storage = getenv('ORBIT_UPLOAD_TEST_STORAGE');
if (PHP_SAPI !== 'cli-server' || !$storage || !is_dir($storage)) {
    http_response_code(404);
    exit;
}
require dirname(__DIR__, 2) . '/vendor/autoload.php';

$app = new Spark\Foundation\Application($storage);
$app->mergeConfig([
    'app' => ['storage_dir' => $storage, 'upload_dir' => "$storage/uploads", 'temp_dir' => "$storage/temp", 'debug' => false],
    'disk' => ['default' => 'local', 'disks' => [
        'public' => ['driver' => 'local', 'root' => "$storage/uploads", 'url' => '/uploads'],
        'local' => ['driver' => 'local', 'root' => "$storage/private"],
        's3' => ['driver' => 's3', 'key' => 'test-key', 'secret' => 'test-secret', 'region' => 'us-east-1',
            'bucket' => 'test-bucket', 'endpoint' => getenv('ORBIT_TEST_S3_ENDPOINT'), 'use_path_style_endpoint' => true],
    ]],
]);
Tests\Fixtures\UploadResource::$disk = $_GET['disk'] ?? 'public';
header('Content-Type: application/json');
try {
    $changes = Tests\Fixtures\UploadResource::processFileUploads(new Spark\Http\Request());
    echo json_encode($changes, JSON_THROW_ON_ERROR);
} catch (Spark\Exceptions\Utils\UploaderUtilException $e) {
    http_response_code(422);
    echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR);
}
