<?php

namespace App\Providers;

use App\Modules\Bread\Commands\CreateResourceStub;
use Spark\Console\Commands;
use Spark\Foundation\Providers\ServiceProvider;

/**
 * This file contains the service provider for cli application.
 * 
 * @package App\Providers
 */
class ConsoleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register the "make:bread" command for creating BREAD resources
        $this->app->make(Commands::class)
            ->addCommand('make:bread', CreateResourceStub::class, 'Create a new BREAD resource');
    }
}