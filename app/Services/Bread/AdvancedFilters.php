<?php

namespace App\Services\Bread;

use InvalidArgumentException;
use Spark\Database\QueryBuilder;

/** Validated, opt-in scalar field filtering for the BREAD filter builder. */
final class AdvancedFilters
{
    public static function apply(QueryBuilder $query, mixed $raw, array $fields): void
    {
        if (!is_string($raw) || strlen($raw) > 32768 || !$fields) self::invalid();
        if (str_starts_with($raw, '1.')) {
            $decoded = base64_decode(strtr(substr($raw, 2), '-_', '+/'), true);
            $compact = json_decode($decoded ?: '', true);
            if (!is_array($compact) || !in_array($compact[0] ?? null, [0, 1], true) || !is_array($compact[1] ?? null)) self::invalid();
            $value = ['match' => $compact[0] ? 'any' : 'all', 'groups' => []];
            foreach ($compact[1] as $group) {
                if (!is_array($group) || !in_array($group[0] ?? null, [0, 1], true) || !is_array($group[1] ?? null)) self::invalid();
                $rules = [];
                foreach ($group[1] as $rule) {
                    if (!is_array($rule)) self::invalid();
                    $rules[] = ['field' => $rule[0] ?? null, 'operator' => $rule[1] ?? null,
                        'value' => $rule[2] ?? null, 'secondValue' => $rule[3] ?? null];
                }
                $value['groups'][] = ['match' => $group[0] ? 'any' : 'all', 'rules' => $rules];
            }
        } else {
            $value = json_decode($raw, true);
        }
        if (!is_array($value) || !in_array($value['match'] ?? null, ['all', 'any'], true)
            || !is_array($value['groups'] ?? null) || count($value['groups']) > 10) self::invalid();
        $allowed = array_column($fields, null, 'key');
        $count = 0;
        foreach ($value['groups'] as $group) {
            if (!is_array($group) || !in_array($group['match'] ?? null, ['all', 'any'], true) || !is_array($group['rules'] ?? null)) self::invalid();
            foreach ($group['rules'] as $rule) {
                if (++$count > 50 || !is_array($rule) || !is_string($rule['field'] ?? null)
                    || !isset($allowed[$rule['field']]) || !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $rule['field'])) self::invalid();
                $type = $allowed[$rule['field']]['type'] ?? 'text';
                $operators = match ($type) {
                    'number' => ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte', 'between'],
                    'date' => ['equals', 'before', 'after', 'between'],
                    'select', 'multiselect', 'boolean' => ['in', 'not_in'],
                    default => ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
                };
                $operator = $rule['operator'] ?? null;
                if (!in_array($operator, [...$operators, 'is_empty', 'is_not_empty'], true)) self::invalid();
                if (in_array($operator, ['is_empty', 'is_not_empty'], true)) continue;
                $items = in_array($operator, ['in', 'not_in'], true) ? ($rule['value'] ?? null) : [$rule['value'] ?? null];
                if (!is_array($items) || !$items || count($items) > 100) self::invalid();
                if ($operator === 'between') $items[] = $rule['secondValue'] ?? null;
                foreach ($items as $item) {
                    if (!is_scalar($item) || strlen((string) $item) > 1000 || (string) $item === '') self::invalid();
                    if ($type === 'number' && !is_numeric($item)) self::invalid();
                    if ($type === 'date' && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $item)
                        || !checkdate((int) substr($item, 5, 2), (int) substr($item, 8, 2), (int) substr($item, 0, 4)))) self::invalid();
                }
            }
        }
        if (!$count) return;
        // Keep every OR group inside an outer AND, preserving authorization and normal filters.
        $query->where(function (QueryBuilder $outer) use ($value, $allowed) {
            foreach ($value['groups'] as $group) {
                if (!$group['rules']) continue;
                $method = $value['match'] === 'any' ? 'orWhere' : 'where';
                $outer->$method(function (QueryBuilder $inner) use ($group, $allowed) {
                    foreach ($group['rules'] as $rule) {
                        $method = $group['match'] === 'any' ? 'orWhere' : 'where';
                        $inner->$method(fn(QueryBuilder $clause) => self::rule($clause, $rule, $allowed[$rule['field']]['type'] ?? 'text'));
                    }
                });
            }
        });
    }

    private static function rule(QueryBuilder $query, array $rule, string $type): void
    {
        $field = $rule['field'];
        $value = $rule['value'] ?? null;
        $operator = $rule['operator'];
        if ($type === 'date' && !in_array($operator, ['is_empty', 'is_not_empty'], true)) {
            if ($operator === 'between') {
                $query->whereDate($field, '>=', $value)->whereDate($field, '<=', $rule['secondValue']);
            } else {
                $query->whereDate($field, match ($operator) { 'equals' => '=', 'before' => '<', 'after' => '>' }, $value);
            }
            return;
        }
        if (in_array($type, ['text', 'select', 'multiselect'], true) && in_array($operator, ['is_empty', 'is_not_empty'], true)) {
            if ($operator === 'is_empty') $query->whereNull($field)->orWhere($field, '');
            else $query->whereNotNull($field)->where($field, '!=', '');
            return;
        }
        match ($operator) {
            'is_empty'  => $query->whereNull($field),
            'is_not_empty' => $query->whereNotNull($field),
            'in' => $query->whereIn($field, $value),
            'not_in' => $query->whereNotIn($field, $value),
            'between' => $query->whereBetween($field, [$value, $rule['secondValue']]),
            'contains' => $query->where($field, 'LIKE', "%$value%"),
            'not_contains' => $query->where($field, 'NOT LIKE', "%$value%"),
            'starts_with' => $query->where($field, 'LIKE', "$value%"),
            'ends_with' => $query->where($field, 'LIKE', "%$value"),
            default => $query->where($field, match ($operator) {
                'equals' => '=', 'not_equals' => '!=', 'gt', 'after' => '>', 'gte' => '>=', 'lt', 'before' => '<', 'lte' => '<=',
            }, $value),
        };
    }

    private static function invalid(): never
    {
        throw new InvalidArgumentException('Invalid advanced filter. Check the fields, operators, and values.');
    }
}
