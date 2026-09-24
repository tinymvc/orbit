<?php
// Disposable S3 transport fixture; it never contacts a cloud provider.
$root = getenv('ORBIT_TEST_S3_STORAGE');
if (PHP_SAPI !== 'cli-server' || !$root || !is_dir($root)) { http_response_code(404); exit; }
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (!preg_match('#^/test-bucket/posts/[a-zA-Z0-9_.-]+$#', $path)) { http_response_code(400); exit; }
$key = basename($path);
file_put_contents("$root/requests.log", $_SERVER['REQUEST_METHOD'] . ' ' . $key . ' ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? '') . "\n", FILE_APPEND);
$file = "$root/$key";
switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT': file_put_contents($file, file_get_contents('php://input')); break;
    case 'DELETE': if (is_file($file)) unlink($file); http_response_code(204); break;
    case 'HEAD':
    case 'GET':
        if (!is_file($file)) { http_response_code(404); break; }
        header('Content-Length: ' . filesize($file));
        header('Content-Type: text/plain');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($file)) . ' GMT');
        if ($_SERVER['REQUEST_METHOD'] === 'GET') readfile($file);
        break;
    default: http_response_code(405);
}
