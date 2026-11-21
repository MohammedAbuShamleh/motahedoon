<?php

namespace App\Enums;

enum ReportStatus: string
{
    case Draft = 'draft';
    case Published = 'published';

    public function label(): string
    {
        return $this === self::Draft ? 'مسودّة' : 'منشور';
    }
}
