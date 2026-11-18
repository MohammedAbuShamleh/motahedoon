<?php

namespace App\Enums;

/** مجموعات أسطر المتن الدائم — القيم مطابقة لعمود content_lines.group. */
enum ContentLineGroup: string
{
    case Value = 'value';
    case Story = 'story';
    case Goal = 'goal';
    case Aspiration = 'aspiration';
    case Intro = 'intro';

    public function label(): string
    {
        return match ($this) {
            self::Value => 'القيم',
            self::Story => 'قصة التأسيس',
            self::Goal => 'الأهداف',
            self::Aspiration => 'التطلّعات',
            self::Intro => 'المقدّمة',
        };
    }

    /** المجموعة التي لكل سطر فيها مصطلح ونصّ، لا نصّ وحده. */
    public function hasTerm(): bool
    {
        return $this === self::Value;
    }
}
