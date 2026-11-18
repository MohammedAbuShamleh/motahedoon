<?php

namespace App\Enums;

/** اللغات الأجنبية. العربية ليست هنا: هي الأعمدة الأساسية لا ترجمة. */
enum Locale: string
{
    case En = 'en';
    case Tr = 'tr';

    public function label(): string
    {
        return $this === self::En ? 'English' : 'Türkçe';
    }
}
