<?php

namespace App\Enums;

/**
 * نمط أيقونات التواصل في التذييل — القيم مطابقة لعمود site_settings.social_style
 * ولأصناف footer__social--{value} في style.css. كلّها مربّعات ليّنة أو بلا
 * إطار: لا دوائر (قرار الهوية).
 */
enum SocialIconStyle: string
{
    case Outline = 'outline';
    case Solid = 'solid';
    case Brand = 'brand';
    case Plain = 'plain';

    public function label(): string
    {
        return match ($this) {
            self::Outline => 'مربّع بإطار رفيع',
            self::Solid => 'مربّع ممتلئ فاتح',
            self::Brand => 'ألوان المنصّات الرسمية',
            self::Plain => 'أيقونات فقط بلا إطار',
        };
    }
}
