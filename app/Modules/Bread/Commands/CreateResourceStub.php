<?php

namespace App\Modules\Bread\Commands;

use Spark\Console\Prompt;
use Spark\Foundation\Console\StubCreation;
use Spark\Support\Str;

class CreateResourceStub
{
    public function __invoke(array $args)
    {
        $name = $args['_args'][0] ?? null;
        if (empty($name)) {
            Prompt::message('Please provide a name for the resource stub.', 'warning');
            return; // Exit early if no name is provided
        }

        $parts = explode('/', $name);
        $name = array_pop($parts); // Get the last part as the name

        if (str_ends_with($name, 'Resource')) {
            $name = substr($name, 0, -8); // Remove 'Resource' suffix if it exists
        }

        $name = Str::plural($name); // Ensure the name is plural
        $slug = Str::slug($name); // Create a slug from the name

        $name = implode('/', [...$parts, $name]); // Reconstruct the name with the original parts

        StubCreation::create(
            $name,
            [
                'stub' => dirname(__DIR__) . '/stubs/resource.stub',
                'destination' => 'app/Http/Resources/::subfolder:ucfirst/::name:ucfirstResource.php',
                'replacements' => [
                    '{{ namespace }}' => 'App\Http\Resources::subfolder:namespace',
                    '{{ class }}' => '::name:ucfirstResource',
                    '{{ model }}' => '::name:ucfirst',
                    '{{ slug }}' => $slug,
                    '{{ name::plural }}' => '::name:pluralize:ucfirst',
                    '{{ name::singular }}' => '::name:singularize:ucfirst',
                    '{{ name::singular::lower }}' => '::name:singularize:lowercase',
                ],
            ]
        );
    }
}