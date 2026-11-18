<?php

namespace App\Enums;

enum TranslationStatus: string
{
    case Machine = 'machine';
    case Pending = 'pending';
    case Approved = 'approved';

    public function label(): string
    {
        return match ($this) {
            self::Machine => 'آلية',
            self::Pending => 'بانتظار المراجعة',
            self::Approved => 'معتمدة',
        };
    }
}
