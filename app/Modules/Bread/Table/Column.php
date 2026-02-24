<?php

namespace App\Modules\Bread\Table;

/**
 * Fluent column builder for BREAD table resources.
 *
 * @example
 *   Column::make('title')->clickToEdit()->truncate(45)
 *   Column::make('status')->badge()->badgeMap([...])
 *   Column::make('user')->belongsTo()->display(['first_name', 'last_name'])->fallback('username')
 *   Column::make('thumbnail')->image()->imageSize('w-12 h-12 rounded-md object-cover')
 */
class Column
{
    protected string $key;
    protected ?string $header = null;
    protected string $type = 'text';
    protected ?array $badgeMap = null;
    protected bool $clickToEdit = false;
    protected int|bool|null $truncate = null;
    protected bool $visible = true;
    protected ?string $className = null;
    protected ?string $accessor = null;
    protected ?string $imageSize = null;
    protected array $display = [];
    protected ?string $fallback = null;

    // ─── Constructor & Factory ──────────────────────────────────────────

    public function __construct(string $key)
    {
        $this->key = $key;
    }

    public static function make(string $key): static
    {
        return new static($key);
    }

    // ─── Type Setters ───────────────────────────────────────────────────

    public function text(): static
    {
        $this->type = 'text';
        return $this;
    }

    public function badge(): static
    {
        $this->type = 'badge';
        return $this;
    }

    public function date(): static
    {
        $this->type = 'date';
        return $this;
    }

    public function image(): static
    {
        $this->type = 'image';
        return $this;
    }

    public function boolean(): static
    {
        $this->type = 'boolean';
        return $this;
    }

    public function belongsTo(): static
    {
        $this->type = 'belongs_to';
        return $this;
    }

    // ─── Property Setters ───────────────────────────────────────────────

    public function header(string $header): static
    {
        $this->header = $header;
        return $this;
    }

    /**
     * Badge value → variant/label mapping.
     *
     * @example ->badgeMap(['draft' => ['label' => 'Draft', 'variant' => 'secondary']])
     */
    public function badgeMap(array $map): static
    {
        $this->badgeMap = $map;
        return $this;
    }

    public function clickToEdit(bool $enabled = true): static
    {
        $this->clickToEdit = $enabled;
        return $this;
    }

    /**
     * Truncate text to N characters (or true for default 50).
     */
    public function truncate(int|bool $chars = true): static
    {
        $this->truncate = $chars;
        return $this;
    }

    /**
     * Set column to be initially hidden.
     */
    public function hidden(bool $hidden = true): static
    {
        $this->visible = !$hidden;
        return $this;
    }

    public function className(string $className): static
    {
        $this->className = $className;
        return $this;
    }

    /**
     * Nested data accessor (e.g. "user.display_name").
     */
    public function accessor(string $accessor): static
    {
        $this->accessor = $accessor;
        return $this;
    }

    /**
     * Image size class for image columns.
     */
    public function imageSize(string $size): static
    {
        $this->imageSize = $size;
        return $this;
    }

    /**
     * Fields to display from a belongs_to relationship.
     *
     * @example ->display(['first_name', 'last_name'])
     */
    public function display(array $fields): static
    {
        $this->display = $fields;
        return $this;
    }

    /**
     * Fallback field for belongs_to when display fields are empty.
     */
    public function fallback(string $field): static
    {
        $this->fallback = $field;
        return $this;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public function getKey(): string
    {
        return $this->key;
    }

    public function isVisible(): bool
    {
        return $this->visible;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = ['key' => $this->key];

        if ($this->header !== null)
            $arr['header'] = $this->header;
        if ($this->type !== 'text')
            $arr['type'] = $this->type;
        if ($this->badgeMap !== null)
            $arr['badgeMap'] = $this->badgeMap;
        if ($this->clickToEdit)
            $arr['clickToEdit'] = true;
        if ($this->truncate !== null)
            $arr['truncate'] = $this->truncate;
        if (!$this->visible)
            $arr['visible'] = false;
        if ($this->className !== null)
            $arr['className'] = $this->className;
        if ($this->accessor !== null)
            $arr['accessor'] = $this->accessor;
        if ($this->imageSize !== null)
            $arr['imageSize'] = $this->imageSize;
        if (!empty($this->display))
            $arr['display'] = $this->display;
        if ($this->fallback !== null)
            $arr['fallback'] = $this->fallback;

        return $arr;
    }
}