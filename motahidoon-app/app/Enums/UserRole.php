<?php

namespace App\Enums;

/** ثلاثة أدوار تكفي اليوم — لا نظام صلاحيات دقيق قبل أن توجد حاجة له. */
enum UserRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Translator = 'translator';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'مدير',
            self::Editor => 'محرّر',
            self::Translator => 'مترجم',
        };
    }
}
