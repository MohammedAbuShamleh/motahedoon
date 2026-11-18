<?php

namespace App\Http\Requests\Admin;

/** قواعد جدول التقرير (رأس، صفوف، تذييل) — يتشاركها طلبا التقرير والقسم. */
final class TableRules
{
    /** @return array<string, list<string>> */
    public static function for(string $field): array
    {
        return [
            $field => ['nullable', 'array'],
            "{$field}.title" => ['nullable', 'string', 'max:512'],
            "{$field}.head" => ["required_with:{$field}", 'array', 'min:1'],
            "{$field}.head.*" => ['nullable', 'string', 'max:512'],
            "{$field}.rows" => ["required_with:{$field}", 'array'],
            "{$field}.rows.*" => ['array'],
            "{$field}.rows.*.*" => ['nullable', 'string', 'max:512'],
            "{$field}.foot" => ['nullable', 'array'],
            "{$field}.foot.*" => ['nullable', 'string', 'max:512'],
            "{$field}.foot_note" => ['nullable', 'string'],
        ];
    }
}
