<?php

namespace App\Support;

/**
 * رابط فيديو خارجي محلَّلاً: يوتيوب أو فيسبوك وحدهما.
 *
 * يوتيوب يُضمَّن من youtube-nocookie (لا ملفّات تتبّع قبل التشغيل)، وغلافه
 * من صوره العامة. فيسبوك يُضمَّن من مشغّل الإضافات، ولا غلاف عامّاً له —
 * فيحتاج صورة غلاف ترفعها اللوحة. أيّ رابط آخر يُرفض عند الحفظ.
 */
final readonly class VideoSource
{
    public const YOUTUBE = 'youtube';
    public const FACEBOOK = 'facebook';

    private function __construct(
        public string $provider,
        public string $id,
        public string $url,
    ) {}

    public static function parse(string $url): ?self
    {
        $url = trim($url);
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $host = preg_replace('/^(www\.|m\.)/', '', $host) ?? $host;
        $path = (string) parse_url($url, PHP_URL_PATH);
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

        $yt = null;
        if ($host === 'youtu.be') {
            $yt = trim($path, '/');
        } elseif (in_array($host, ['youtube.com', 'youtube-nocookie.com', 'music.youtube.com'], true)) {
            if ($path === '/watch') {
                $yt = $query['v'] ?? null;
            } elseif (preg_match('#^/(embed|shorts|live|v)/([^/?]+)#', $path, $m)) {
                $yt = $m[2];
            }
        }
        if (is_string($yt) && preg_match('/^[A-Za-z0-9_-]{11}$/', $yt)) {
            return new self(self::YOUTUBE, $yt, $url);
        }

        if (in_array($host, ['facebook.com', 'fb.watch', 'web.facebook.com'], true)) {
            // معرّف رقمي إن ظهر (videos/123، ‏watch?v=123، ‏reel/123)، وإلا الرابط نفسه
            $id = $query['v'] ?? (preg_match('#/(?:videos|reel)/(?:[^/]+/)?(\d+)#', $path, $m) ? $m[1] : null);

            return new self(self::FACEBOOK, is_string($id) ? $id : '', $url);
        }

        return null;
    }

    /** عنوان التضمين — يُحمَّل في iframe بعد نقر الزائر فقط */
    public function embed(): string
    {
        return $this->provider === self::YOUTUBE
            ? "https://www.youtube-nocookie.com/embed/{$this->id}?autoplay=1&rel=0&modestbranding=1"
            : 'https://www.facebook.com/plugins/video.php?autoplay=true&show_text=false&href='.rawurlencode($this->url);
    }

    /** الغلاف العامّ إن وُجد (يوتيوب وحده) */
    public function thumbnail(): ?string
    {
        return $this->provider === self::YOUTUBE ? "https://i.ytimg.com/vi/{$this->id}/hqdefault.jpg" : null;
    }
}
