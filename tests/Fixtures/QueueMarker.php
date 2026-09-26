<?php

namespace Tests\Fixtures;

final class QueueMarker
{
    public function handle(): void
    {
        storage()->put('queue-ran.txt', 'completed');
    }
}
