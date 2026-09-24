<?php

namespace Tests\Feature;

use Spark\Cache\Cache;
use Spark\Facades\Route;
use Spark\Queue\Job;
use Spark\Queue\Queue;
use Tests\Fixtures\QueueMarker;
use Tests\TestCase;

final class FrameworkIntegrationTest extends TestCase
{
    public function test_sqlite_cache_lock_queue_and_disks_use_isolated_configuration(): void
    {
        $cache = Cache::make('orbit-test');
        $cache->store('sample', ['value' => 42], '5 minutes');
        $this->assertSame(['value' => 42], $cache->retrieve('sample'));
        $this->assertSame('locked', Cache::lock('orbit-test', fn() => 'locked'));
        $queue = $this->app->get(Queue::class);
        $queue->push(new Job(QueueMarker::class, scheduledTime: '1 minute ago'));
        $this->assertCount(1, $queue->getJobs());
        $level = ob_get_level();
        ob_start();
        try {
            $queue->work(once: true, timeout: 5, sleep: 0);
        } finally {
            while (ob_get_level() > $level) { ob_end_clean(); }
        }
        $this->assertSame([], $queue->getFailedJobs());
        $this->assertSame([], $queue->getJobs(status: 'pending'));
        $this->assertSame('completed', disk()->get('queue-ran.txt'));
        $this->assertTrue(str_starts_with(disk()->path('queue-ran.txt'), $this->storagePath));
        $this->assertSame('/uploads/test.txt', disk('public')->url('test.txt'));
    }

    public function test_cors_preflight_and_normal_request_follow_config(): void
    {
        $called = false;
        Route::get('/cors-test', function () use (&$called) {
            $called = true;
            return json(['ok' => true]);
        })->middleware('cors');
        $this->options('/cors-test', headers: ['Origin' => 'https://example.test',
            'Access-Control-Request-Method' => 'GET', 'Access-Control-Request-Headers' => 'Content-Type'])
            ->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'https://example.test')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
        $this->assertFalse($called);
        $this->options('/cors-test', headers: ['Origin' => 'https://example.test',
            'Access-Control-Request-Method' => 'GET', 'Access-Control-Request-Headers' => 'X-Not-Allowed'])
            ->assertForbidden();
        $this->assertFalse($called);
        $this->get('/cors-test', ['Origin' => 'https://example.test'])->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'https://example.test');
        $this->assertTrue($called);
    }
}
