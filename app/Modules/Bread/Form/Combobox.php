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
 *   // Multiple-select with dynamic options loaded from server  
 *   Combobox::make('categories')
 *       ->multiple()
 *       ->dynamicOptions('categories')
 *       ->placeholder('Select categories...')
 *
 *   // Taggable mode — user can create new options on the fly
 *   Combobox::make('tags')
 *       ->multiple()
 *       ->taggable()
 *       ->dynamicOptions('tags')
 *       ->placeholder('Add tags...')
 *
 *   // For belongsToMany relationships
 *   Combobox::make('categories')
 *       ->multiple()
 *       ->relationship('categories', 'id', 'name')
 *       ->dynamicOptions('categories')
 */
class Combobox extends Field
{
    protected bool $multiple = false;
    protected bool $taggable = false;
    protected array|string|null $options = null;
    protected null|int $maxItems = null;
    protected null|string $searchRoute = null;

    /** belongsToMany relationship config */
    protected null|string $relationName = null;
    protected null|string $relationValueKey = null;
    protected null|string $relationLabelKey = null;

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
     * Configure as a belongsToMany relationship field.
     *
     * This tells the BREAD system to use sync() on this relationship
     * instead of storing the value directly on the model.
     *
     * @param string $name      The relationship method name on the model (e.g. "categories")
     * @param string $valueKey  The key to use as option value (e.g. "id")
     * @param string $labelKey  The key to use as option label (e.g. "name")
     */
    public function relationship(string $name, string $valueKey = 'id', string $labelKey = 'name'): static
    {
        $this->relationName = $name;
        $this->relationValueKey = $valueKey;
        $this->relationLabelKey = $labelKey;
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
        if ($this->relationName !== null)
            $arr['relationship'] = $this->relationName;

        return $arr;
    }

    public function toValidationRule(null|int $recordId = null): null|string
    {
        if ($this->multiple || $this->relationName) {
            // Array validation — handled separately
            return null;
        }

        $parts = [$this->required ? 'required' : 'nullable'];
        return implode('|', $parts);
    }
}
