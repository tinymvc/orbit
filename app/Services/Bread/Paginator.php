<?php

namespace App\Services\Bread;

/** Explicit request page and clamped offsets, including simulated HTTP requests. */
final class Paginator extends \Spark\Utils\Paginator
{
    public function __construct(int $total, int $limit, private int $requestedPage)
    {
        parent::__construct($total, $limit);
    }

    public function keywordValue(): int
    {
        return max(1, $this->requestedPage);
    }
}
