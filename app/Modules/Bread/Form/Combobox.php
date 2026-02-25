<?php

namespace App\Modules\Bread\Form;

/**
 * Combobox field — powerful searchable select with multiple modes.
 *
 * Supports: single select, multiple select, taggable (create new options),
 * and dynamic/ajax-loaded options.
 *
 * @example
 *   // Single-select with static options
 *   Combobox::make('category_id')
 *       ->options([['value' => '1', 'label' => 'Tech'], ['value' => '2', 'label' => 'Sports']])
 *
 *   // BelongsTo relationship (single select, stores FK on the model)
 *   Combobox::make('user_id')
 *       ->belongsTo('user', 'id', 'display_name')
 *       ->searchRoute(self::getUrl())
 *       ->placeholder('Select author...')
 *
 *   // BelongsToMany relationship (multiple select, syncs pivot table)
 *   Combobox::make('categories')
 *       ->belongsToMany('categories', 'id', 'name')
 *       ->searchRoute(self::getUrl())
 *       ->placeholder('Select categories...')
 *
 *   // Taggable mode — user can create new options on the fly
 *   Combobox::make('tags')
 *       ->multiple()
 *       ->taggable()
 *       ->dynamicOptions('tags')
 *       ->placeholder('Add tags...')
 */
class Combobox extends Field
{
    protected bool $multiple = false;
    protected bool $taggable = false;
    protected array|string|null $options = null;
    protected null|int $maxItems = null;
    protected null|string $searchRoute = null;

    /** belongsTo / belongsToMany relationship config */
    protected null|string $relationName = null;
    protected null|string $relationValueKey = null;
    protected null|string $relationLabelKey = null;
    protected string $relationType = 'belongsToMany'; // 'belongsTo' or 'belongsToMany'

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return 'combobox';
    }

    // ─── Property Setters ───────────────────────────────────────────────

    /** Enable multiple selection */
    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;
        return $this;
    }

    /** Enable taggable mode — allows creating new options */
    public function taggable(bool $taggable = true): static
    {
        $this->taggable = $taggable;
        return $this;
    }

    /**
     * Set static options.
     *
     * @param array|string $options Array of ['value' => ..., 'label' => ...] or "dynamic:key"
     */
    public function options(array|string $options): static
    {
        $this->options = $options;
        return $this;
    }

    /** Use dynamic options from the server dynamicProps() */
    public function dynamicOptions(string $key): static
    {
        $this->options = "dynamic:$key";
        return $this;
    }

    /** Max number of selectable items (multiple mode only) */
    public function maxItems(int $max): static
    {
        $this->maxItems = $max;
        return $this;
    }

    /** Server route URL for async search (ajax mode) */
    public function searchRoute(string $route): static
    {
        $this->searchRoute = $route;
        return $this;
    }

    /**
     * Configure as a belongsTo relationship field (single select, stores FK on the model).
     *
     * The field name should be the foreign key column (e.g. "user_id").
     * The relationship method name is used for ajax search to resolve the related model.
     *
     * @param string $name      The relationship method name on the model (e.g. "user")
     * @param string $valueKey  The key to use as option value (e.g. "id")
     * @param string $labelKey  The key to use as option label (e.g. "display_name")
     */
    public function belongsTo(string $name, string $valueKey = 'id', string $labelKey = 'name'): static
    {
        $this->relationName = $name;
        $this->relationValueKey = $valueKey;
        $this->relationLabelKey = $labelKey;
        $this->relationType = 'belongsTo';
        // belongsTo is always single select — don't force multiple
        return $this;
    }

    /**
     * Configure as a belongsToMany relationship field (multiple select, syncs pivot table).
     *
     * The field name should match the relationship method name (e.g. "categories").
     *
     * @param string $name      The relationship method name on the model (e.g. "categories")
     * @param string $valueKey  The key to use as option value (e.g. "id")
     * @param string $labelKey  The key to use as option label (e.g. "name")
     */
    public function belongsToMany(string $name, string $valueKey = 'id', string $labelKey = 'name'): static
    {
        $this->relationName = $name;
        $this->relationValueKey = $valueKey;
        $this->relationLabelKey = $labelKey;
        $this->relationType = 'belongsToMany';
        $this->multiple = true; // belongsToMany is always multiple
        return $this;
    }

    // ─── Getters ────────────────────────────────────────────────────────

    public function isMultiple(): bool
    {
        return $this->multiple;
    }

    public function isRelationship(): bool
    {
        return $this->relationName !== null;
    }

    public function getRelationName(): null|string
    {
        return $this->relationName;
    }

    public function getRelationValueKey(): null|string
    {
        return $this->relationValueKey;
    }

    public function getRelationLabelKey(): null|string
    {
        return $this->relationLabelKey;
    }

    public function getRelationType(): string
    {
        return $this->relationType;
    }

    public function isBelongsTo(): bool
    {
        return $this->relationName !== null && $this->relationType === 'belongsTo';
    }

    public function isBelongsToMany(): bool
    {
        return $this->relationName !== null && $this->relationType === 'belongsToMany';
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = parent::toArray();

        if ($this->multiple)
            $arr['multiple'] = true;
        if ($this->taggable)
            $arr['taggable'] = true;
        if ($this->options !== null)
            $arr['options'] = $this->options;
        if ($this->maxItems !== null)
            $arr['maxItems'] = $this->maxItems;
        if ($this->searchRoute !== null)
            $arr['searchRoute'] = $this->searchRoute;
        if ($this->relationName !== null) {
            $arr['relationship'] = $this->relationName;
            $arr['relationType'] = $this->relationType;
        }

        return $arr;
    }

    public function toValidationRule(null|int $recordId = null): null|string
    {
        // belongsToMany: array validation handled separately via sync
        if ($this->relationType === 'belongsToMany' && $this->relationName) {
            return null;
        }

        // belongsTo or regular combobox: validate the FK value
        $parts = [$this->required ? 'required' : 'nullable'];

        if ($this->multiple && !$this->relationName) {
            // Non-relationship multiple: array handled separately
            return null;
        }

        return implode('|', $parts);
    }
}
