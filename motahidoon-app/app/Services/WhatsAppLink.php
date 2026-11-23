<?php

namespace App\Services;

use App\Models\SiteSetting;

/**
 * زرّ واتساب العائم: الإعداد من اللوحة (site_settings.whatsapp_*)، وما فرغ منه
 * يسقط إلى config/site.php ثم إلى قيم مدمجة — فلا يختفي الزرّ لأنّ حقلاً فارغ
 * أو لأنّ مخبأ الإعدادات على الخادم قديم.
 */
final class WhatsAppLink
{
    public const DEFAULT_NUMBER = '905530827711';

    public const DEFAULT_TEXT = [
        'ar' => 'السلام عليكم ورحمة الله، أتواصل معكم من موقع :org، وأودّ الاستفسار عن: ',
        'en' => 'Hello, I am reaching out from the :org website and would like to ask about: ',
        'tr' => 'Merhaba, :org web sitesinden ulaşıyorum ve şu konuda bilgi almak istiyorum: ',
    ];

    /** الإعداد الفعّال بعد السقوط: للّوحة وللرابط معاً. @return array{enabled: bool, number: string, text: array<string, string>} */
    public static function settings(?SiteSetting $s = null): array
    {
        $s ??= SiteSetting::query()->first();
        $config = (array) config('site.whatsapp.text', []);
        $saved = (array) ($s?->whatsapp_text ?? []);

        $text = [];
        foreach (array_keys(self::DEFAULT_TEXT) as $locale) {
            $text[$locale] = trim((string) ($saved[$locale] ?? '')) !== ''
                ? (string) $saved[$locale]
                : (string) ($config[$locale] ?? self::DEFAULT_TEXT[$locale]);
        }

        $number = preg_replace('/\D+/', '', (string) ($s?->whatsapp_number ?: config('site.whatsapp.number', self::DEFAULT_NUMBER)));

        return [
            'enabled' => (bool) ($s?->whatsapp_enabled ?? true),
            'number' => $number !== '' ? $number : self::DEFAULT_NUMBER,
            'text' => $text,
        ];
    }

    /** رابط wa.me بلغة الصفحة واسم التجمّع مكان «:org»، أو null إن أُطفئ الزرّ */
    public static function url(string $locale, string $orgName, ?SiteSetting $s = null): ?string
    {
        $cfg = self::settings($s);
        if (! $cfg['enabled']) {
            return null;
        }
        $text = str_replace(':org', $orgName, $cfg['text'][$locale] ?? $cfg['text']['ar']);

        return "https://wa.me/{$cfg['number']}".($text === '' ? '' : '?text='.rawurlencode($text));
    }
}
