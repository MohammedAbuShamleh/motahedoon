<?php

namespace App\Services\Admin;

/** يحوّل جدول النموذج إلى أعمدة report_tables، ويوحّد طول الصفوف على الرأس. */
final class TableData
{
    /** @param array<string, mixed> $t  @return array<string, mixed> */
    public static function from(array $t): array
    {
        $width = count($t['head']);
        $pad = fn (array $row): array => array_slice(array_pad(array_map(
            fn ($c) => $c ?? '', array_values($row)
        ), $width, ''), 0, $width);

        $foot = array_filter($t['foot'] ?? [], fn ($c) => $c !== null && $c !== '');

        return [
            'title' => $t['title'] ?? null,
            'head' => array_map(fn ($c) => $c ?? '', array_values($t['head'])),
            'rows' => array_map($pad, array_values($t['rows'] ?? [])),
            'foot' => $foot === [] ? null : $pad($t['foot']),
            'foot_note' => $t['foot_note'] ?? null,
        ];
    }
}
