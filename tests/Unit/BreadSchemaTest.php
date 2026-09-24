<?php

namespace Tests\Unit;

use App\Services\Bread\Form;
use Spark\Testing\TestCase;

final class BreadSchemaTest extends TestCase
{
    public function test_relocated_fields_keep_the_frontend_schema_contract(): void
    {
        foreach ([Form\TextInput::class => 'text', Form\Textarea::class => 'textarea',
            Form\Checkbox::class => 'checkbox', Form\Toggle::class => 'switch',
            Form\Select::class => 'select', Form\Combobox::class => 'combobox',
            Form\DatePicker::class => 'date', Form\FileUpload::class => 'file',
            Form\Hidden::class => 'hidden', Form\RichEditor::class => 'richtext',
            Form\SlugInput::class => 'slug'] as $class => $type) {
            $schema = $class::make('value')->label('Value')->required()->toArray();
            $this->assertSame($type, $schema['type']);
            $this->assertSame('value', $schema['name']);
            $this->assertTrue($schema['required']);
        }
    }

    public function test_validation_and_relationship_metadata(): void
    {
        $slug = Form\SlugInput::make('slug')->from('title')->required()->unique('posts', 'slug')->maxLength(120);
        $this->assertSame('required|max:120|unique:posts,slug,12', $slug->toValidationRule(12));
        $this->assertSame('title', $slug->toArray()['slugFrom']);
        $field = Form\Combobox::make('categories')->belongsToMany('categories')->dynamicOptions('categories');
        $this->assertTrue($field->isBelongsToMany());
        $this->assertTrue($field->toArray()['multiple']);
        $this->assertSame('dynamic:categories', $field->toArray()['options']);
        $upload = Form\FileUpload::make('photo')->uploadTo('posts')->maxFileSize(4096)->acceptedTypes(['png']);
        $this->assertSame(['png'], $upload->toArray()['acceptedTypes']);
        $this->assertSame(4096, $upload->getMaxFileSize());
    }
}
