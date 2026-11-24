<?php

namespace App\Services\Content;

use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\Visitor\AttributeSanitizer\AttributeSanitizerInterface;

/**
 * يصفّي قيمة style في النصّ المنسَّق: خاصيّة بخاصيّة، وما لم يُسمَح به يسقط.
 *
 * اللون محصور في لوحة الهوية المقفلة (HANDOFF ٧-ب «لا تُضف لوناً»):
 * أربعة ألوان نصّ تجتاز AA على الورق، ولون تظليل واحد هو الفاصل الرمادي.
 * الأحمر للكلمة لا للمساحة، فلا خلفية حمراء ولا خضراء.
 * الخطّ محصور في خطوط الموقع الثلاثة.
 */
final class RichTextStyle implements AttributeSanitizerInterface
{
    /** حبري · أخضر · زيتوني · أحمر — كلها ≥ 4.5:1 على الورق */
    private const TEXT_COLORS = ['#1a1a1a', '#0c7b3f', '#5c5b34', '#cf2129'];

    /** التظليل: الفاصل الرمادي وحده — النصّ الحبري فوقه 13:1 */
    private const MARK_COLORS = ['#e3e4e5'];

    private const FONTS = ['thmanyah sans', 'thmanyah serif text', 'thmanyah serif display'];

    private const ALIGN = ['left', 'right', 'center', 'justify', 'start', 'end'];

    /** عرض الأعمدة والصور وحدها تحمل أبعاداً */
    private const SIZED = ['table', 'col', 'td', 'th', 'img'];

    public function getSupportedElements(): ?array
    {
        return null;
    }

    public function getSupportedAttributes(): ?array
    {
        return ['style'];
    }

    public function sanitizeAttribute(string $element, string $attribute, string $value, HtmlSanitizerConfig $config): ?string
    {
        $kept = [];

        foreach (explode(';', $value) as $decl) {
            if (! str_contains($decl, ':')) {
                continue;
            }
            [$prop, $val] = array_map('trim', explode(':', $decl, 2));
            $prop = strtolower($prop);
            $clean = match ($prop) {
                'color' => $this->color($val, self::TEXT_COLORS),
                'background-color' => $this->color($val, self::MARK_COLORS),
                'font-family' => $this->font($val),
                'font-size' => $this->size($val),
                'line-height' => preg_match('/^(1(\.\d{1,2})?|2(\.\d{1,2})?|3)$/', $val) ? $val : null,
                'text-align' => in_array(strtolower($val), self::ALIGN, true) ? strtolower($val) : null,
                'width', 'min-width' => in_array($element, self::SIZED, true)
                    && preg_match('/^\d{1,4}px$|^\d{1,3}%$/', $val) ? $val : null,
                default => null,
            };
            if ($clean !== null) {
                $kept[$prop] = $clean;
            }
        }

        if ($kept === []) {
            return null;
        }

        return implode('; ', array_map(fn ($p, $v) => "{$p}: {$v}", array_keys($kept), $kept));
    }

    /** يقبل #rgb و#rrggbb وrgb(r, g, b)، ويُرجع الشكل الموحّد إن كان في القائمة. */
    private function color(string $val, array $allowed): ?string
    {
        $val = strtolower(str_replace(' ', '', $val));

        if (preg_match('/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(,1(\.0+)?)?\)$/', $val, $m)) {
            $val = sprintf('#%02x%02x%02x', min(255, (int) $m[1]), min(255, (int) $m[2]), min(255, (int) $m[3]));
        } elseif (preg_match('/^#([0-9a-f])([0-9a-f])([0-9a-f])$/', $val, $m)) {
            $val = "#{$m[1]}{$m[1]}{$m[2]}{$m[2]}{$m[3]}{$m[3]}";
        }

        return in_array($val, $allowed, true) ? strtoupper($val) : null;
    }

    private function font(string $val): ?string
    {
        $first = strtolower(trim(explode(',', $val)[0], " \"'"));

        return in_array($first, self::FONTS, true) ? '"'.ucwords($first).'"' : null;
    }

    /** 12–48px أو 0.75–3rem/em: سلّم المحرّر، ولا أحجام تكسر التخطيط */
    private function size(string $val): ?string
    {
        if (preg_match('/^(\d{1,2}(\.\d{1,2})?)px$/', $val, $m)) {
            return $m[1] >= 12 && $m[1] <= 48 ? $val : null;
        }
        if (preg_match('/^(\d(\.\d{1,3})?)(rem|em)$/', $val, $m)) {
            return $m[1] >= 0.75 && $m[1] <= 3 ? $val : null;
        }

        return null;
    }
}
