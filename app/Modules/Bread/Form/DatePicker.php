<?php

namespace App\Modules\Bread\Form;

/**
 * Date / DateTime picker field.
 *
 * @example
 *   DatePicker::make('published_at')
 *   DatePicker::make('scheduled_at')->withTime()->disablePast()
 */
class DatePicker extends Field
{
    protected bool $includeTime = false;
    protected bool $disablePast = false;
    protected bool $disableFuture = false;

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return $this->includeTime ? 'datetime' : 'date';
    }

    // ─── Property Setters ───────────────────────────────────────────────

    /** Include a time picker alongside the date */
    public function withTime(): static
    {
        $this->includeTime = true;
        return $this;
    }

    /** Alias for withTime(), reads like: DatePicker::make()->dateTime() */
    public function dateTime(): static
    {
        return $this->withTime();
    }

    public function disablePast(): static
    {
        $this->disablePast = true;
        return $this;
    }

    /** Alias for disablePast */
    public function disablePastDates(): static
    {
        return $this->disablePast();
    }

    public function disableFuture(): static
    {
        $this->disableFuture = true;
        return $this;
    }

    /** Alias for disableFuture */
    public function disableFutureDates(): static
    {
        return $this->disableFuture();
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = parent::toArray();

        if ($this->disablePast)
            $arr['disablePastDates'] = true;
        if ($this->disableFuture)
            $arr['disableFutureDates'] = true;

        return $arr;
    }

    public function toValidationRule(null|int $recordId = null): null|string
    {
        $parts = [$this->required ? 'required' : 'nullable', 'date'];
        return implode('|', $parts);
    }
}
