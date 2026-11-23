<?php

namespace App\Enums;

/**
 * منصّات التواصل المعروفة — القيم مطابقة لعمود social_links.platform
 * ولأيقونات SocialIcon في الواجهة. «other» لأيّ رابط آخر باسم يكتبه المحرّر.
 */
enum SocialPlatform: string
{
    case Facebook = 'facebook';
    case Instagram = 'instagram';
    case X = 'x';
    case Youtube = 'youtube';
    case Telegram = 'telegram';
    case Tiktok = 'tiktok';
    case Whatsapp = 'whatsapp';
    case Linkedin = 'linkedin';
    case Snapchat = 'snapchat';
    case Threads = 'threads';
    case Other = 'other';

    /** التسمية في اللوحة */
    public function label(): string
    {
        return match ($this) {
            self::Facebook => 'فيسبوك',
            self::Instagram => 'إنستغرام',
            self::X => 'X (تويتر)',
            self::Youtube => 'يوتيوب',
            self::Telegram => 'تيليجرام',
            self::Tiktok => 'تيك توك',
            self::Whatsapp => 'واتساب',
            self::Linkedin => 'لينكدإن',
            self::Snapchat => 'سناب شات',
            self::Threads => 'ثريدز',
            self::Other => 'منصّة أخرى',
        };
    }

    /** نطاقات كلّ منصّة، لتعرّفها من الرابط الملصوق. @return list<string> */
    private function hosts(): array
    {
        return match ($this) {
            self::Facebook => ['facebook.com', 'fb.com', 'fb.me'],
            self::Instagram => ['instagram.com'],
            self::X => ['x.com', 'twitter.com'],
            self::Youtube => ['youtube.com', 'youtu.be'],
            self::Telegram => ['t.me', 'telegram.me', 'telegram.org'],
            self::Tiktok => ['tiktok.com'],
            self::Whatsapp => ['wa.me', 'whatsapp.com'],
            self::Linkedin => ['linkedin.com'],
            self::Snapchat => ['snapchat.com'],
            self::Threads => ['threads.net', 'threads.com'],
            self::Other => [],
        };
    }

    /** المنصّة من نطاق الرابط، و«أخرى» إن لم يُعرف. */
    public static function detect(string $url): self
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $host = preg_replace('/^(www\.|m\.|web\.|mobile\.)/', '', $host) ?? $host;
        foreach (self::cases() as $p) {
            foreach ($p->hosts() as $h) {
                if ($host === $h || str_ends_with($host, '.'.$h)) {
                    return $p;
                }
            }
        }

        return self::Other;
    }
}
