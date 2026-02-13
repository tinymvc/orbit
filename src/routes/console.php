<?php

use Orbit\Console\Commands\Install;

command('orbit:install', Install::class, 'Install the Orbit admin panel')
    ->help('run this command to install the Orbit admin panel, create super user, run migrations and set up initial configuration.');
