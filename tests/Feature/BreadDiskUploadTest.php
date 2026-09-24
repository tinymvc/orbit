<?php

namespace Tests\Feature;

use Tests\TestCase;

final class BreadDiskUploadTest extends TestCase
{
    public function test_local_public_and_s3_uploads_and_partial_batch_rollback(): void
    {
        if (!extension_loaded('curl') || !function_exists('proc_open')) $this->markTestSkipped('Requires cURL and proc_open.');
        $processes = [];
        mkdir("$this->storagePath/s3");
        try {
            $s3 = $this->startServer('s3-server.php', ['ORBIT_TEST_S3_STORAGE' => "$this->storagePath/s3"], $processes);
            $http = $this->startServer('upload-server.php', ['ORBIT_UPLOAD_TEST_STORAGE' => $this->storagePath,
                'ORBIT_TEST_S3_ENDPOINT' => "http://$s3"], $processes);
            $source = "$this->storagePath/source.txt";
            file_put_contents($source, 'disk upload');
            foreach (['public' => 'uploads/posts', 'local' => 'private/posts', 's3' => 's3'] as $disk => $directory) {
                [$status, $body] = $this->upload("http://$http/?disk=$disk", [
                    'thumbnail' => new \CURLFile($source, 'text/plain', 'single.txt'),
                    'attachments[0]' => new \CURLFile($source, 'text/plain', 'first.txt'),
                    'attachments[2]' => new \CURLFile($source, 'text/plain', 'second.txt'),
                ]);
                $this->assertSame(200, $status, json_encode($body));
                $this->assertCount(2, $body['attachments']);
                foreach ([$body['thumbnail'], ...$body['attachments']] as $key) {
                    $this->assertTrue(str_starts_with($key, 'posts/'));
                    $this->assertSame('disk upload', file_get_contents("$this->storagePath/$directory/" . basename($key)));
                }
                if (extension_loaded('gd')) {
                    $image = imagecreatetruecolor(10, 10);
                    $png = "$this->storagePath/source.png";
                    imagepng($image, $png);
                    [$status, $body] = $this->upload("http://$http/?disk=$disk", ['image' => new \CURLFile($png, 'image/png', 'photo.png')]);
                    $this->assertSame(200, $status, json_encode($body));
                    $size = getimagesize("$this->storagePath/$directory/" . basename($body['image']));
                    $this->assertSame([4, 4], array_slice($size, 0, 2));
                }
                $before = glob("$this->storagePath/$directory/*.txt");
                [$status] = $this->upload("http://$http/?disk=$disk", [
                    'thumbnail' => new \CURLFile($source, 'text/plain', 'rollback-single.txt'),
                    'attachments[0]' => new \CURLFile($source, 'text/plain', 'rollback-first.txt'),
                    'attachments[1]' => new \CURLFile($source, 'text/plain', 'forbidden.php'),
                ]);
                $this->assertSame(422, $status);
                $this->assertSame($before, glob("$this->storagePath/$directory/*.txt"), 'No orphan keys after a failed batch.');
            }
            $log = file_get_contents("$this->storagePath/s3/requests.log");
            $this->assertTrue(str_contains($log, 'AWS4-HMAC-SHA256 Credential=test-key/'));
            $this->assertTrue(str_contains($log, 'DELETE rollback-'));
            $this->assertSame([], glob("$this->storagePath/temp/disk-uploads/posts/*"));
        } finally {
            foreach ($processes as $process) { proc_terminate($process); proc_close($process); }
        }
    }

    private function startServer(string $fixture, array $environment, array &$processes): string
    {
        $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
        $this->assertTrue($socket !== false, $error);
        $address = stream_socket_get_name($socket, false);
        fclose($socket);
        $process = proc_open([PHP_BINARY, '-S', $address, dirname(__DIR__) . '/Fixtures/' . $fixture],
            [0 => ['pipe', 'r'], 1 => ['file', "$this->storagePath/$fixture.log", 'a'], 2 => ['file', "$this->storagePath/$fixture.log", 'a']],
            $pipes, dirname(__DIR__, 2), [...getenv(), ...$environment]);
        $this->assertTrue(is_resource($process));
        $processes[] = $process;
        fclose($pipes[0]);
        for ($attempt = 0; $attempt < 60; $attempt++) {
            $connection = @stream_socket_client("tcp://$address", $errno, $error, 0.1);
            if ($connection) { fclose($connection); return $address; }
            usleep(50000);
        }
        $this->fail('Fixture server did not start.');
    }

    private function upload(string $url, array $data): array
    {
        $curl = curl_init($url);
        curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $data,
            CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
        try {
            $body = curl_exec($curl);
            $this->assertTrue($body !== false, curl_error($curl));
            return [curl_getinfo($curl, CURLINFO_RESPONSE_CODE), json_decode($body, true, flags: JSON_THROW_ON_ERROR)];
        } finally { curl_close($curl); }
    }
}
