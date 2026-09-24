<?php

namespace Tests\Fixtures;

class SoftDeleteCategory extends \App\Models\Category
{
    protected string $table = 'categories';
    protected const USE_SOFT_DELETES = true;
    protected const SOFT_DELETE_COLUMN = 'removed_at';
}
