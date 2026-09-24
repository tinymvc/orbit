<?php

namespace Tests\Fixtures;

final class QueueMarker
{
    public function handle(): void
    {
        disk()->put('queue-ran.txt', 'completed');
    }
}
