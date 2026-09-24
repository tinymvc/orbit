<?php

namespace Tests\Feature;

use Tests\TestCase;

final class MultipartUploadTest extends TestCase
{
    public function test_real_single_and_multiple_uploads_and_invalid_file_rejection(): void
    {
        if (!extension_loaded('curl') || !function_exists('proc_open')) {
            $this->markTestSkipped('Multipart tests require ext-curl and proc_open.');
        }
        $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
        $this->assertTrue($socket !== false, $error);
        $address = stream_socket_get_name($socket, false);
        fclose($socket);
        $log = "$this->storagePath/server.log";
        $process = proc_open([PHP_BINARY, '-S', $address, dirname(__DIR__) . '/Fixtures/upload-server.php'],
            [0 => ['pipe', 'r'], 1 => ['file', $log, 'a'], 2 => ['file', $log, 'a']], $pipes,
            dirname(__DIR__, 2), [...getenv(), 'ORBIT_UPLOAD_TEST_STORAGE' => $this->storagePath]);
        $this->assertTrue(is_resource($process));
        fclose($pipes[0]);
        try {
            $ready = false;
            for ($attempt = 0; $attempt < 60; $attempt++) {
                $connection = @stream_socket_client("tcp://$address", $errno, $error, 0.1);
                if ($connection) {
                    fclose($connection);
                    $ready = true;
                    break;
                }
                usleep(50000);
            }
            $this->assertTrue($ready, 'Upload server did not start: ' . file_get_contents($log));
            $file = "$this->storagePath/document.txt";
            file_put_contents($file, 'uploaded content');
            [$status, $body] = $this->upload($address, ['thumbnail' => new \CURLFile($file, 'text/plain', 'document.txt')]);
            $this->assertSame(200, $status, json_encode($body));
            $this->assertSame('uploaded content', file_get_contents("$this->storagePath/uploads/" . $body['thumbnail']));
            [$status, $body] = $this->upload($address, [
                'attachments[0]' => new \CURLFile($file, 'text/plain', 'one.txt'),
                'attachments[1]' => new \CURLFile($file, 'text/plain', 'two.txt'),
            ]);
            $this->assertSame(200, $status, json_encode($body));
            $this->assertCount(2, $body['attachments']);
            foreach ($body['attachments'] as $path) {
                $this->assertSame('uploaded content', file_get_contents("$this->storagePath/uploads/$path"));
            }
            [$status] = $this->upload($address, ['thumbnail' => new \CURLFile($file, 'text/plain', 'forbidden.php')]);
            $this->assertSame(422, $status);
            file_put_contents($file, str_repeat('x', 2048));
            [$status] = $this->upload($address, ['thumbnail' => new \CURLFile($file, 'text/plain', 'large.txt')]);
            $this->assertSame(422, $status);
            $this->assertCount(3, glob("$this->storagePath/uploads/posts/*"));
        } finally {
            proc_terminate($process);
            proc_close($process);
        }
    }

    private function upload(string $address, array $data): array
    {
        $curl = curl_init("http://$address/");
        curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $data,
            CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
        try {
            $response = curl_exec($curl);
            $this->assertTrue($response !== false, curl_error($curl));
            return [curl_getinfo($curl, CURLINFO_RESPONSE_CODE), json_decode($response, true, flags: JSON_THROW_ON_ERROR)];
        } finally {
            curl_close($curl);
        }
    }
}
