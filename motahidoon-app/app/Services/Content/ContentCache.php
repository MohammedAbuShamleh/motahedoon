<?php

namespace App\Services\Content;

use Closure;
use Illuminate\Contracts\Cache\Repository;

/**
 * مخبأ شجرة المحتوى.
 *
 * الشجرة تُقرأ في كل صفحة وتتغيّر نادراً (حين يحرّر أحد من اللوحة)،
 * فتُخبَّأ بلا انتهاء وتُبطَل عند كل كتابة (انظر FlushesContentCache).
 * المفاتيح معدودة فلا حاجة لوسوم المخبأ التي لا يدعمها مخزن database.
 */
final class ContentCache
{
    private const PREFIX = 'content.';

    /* videos.*: مكتبة الفيديو بكلّ لغة (VideoLibrary) — تُبطَل مع الشجرة */
    private const KEYS = ['base', 'overlay.en', 'overlay.tr', 'videos.ar', 'videos.en', 'videos.tr'];

    private bool $paused = false;

    public function __construct(private readonly Repository $store) {}

    /** @template T  @param Closure(): T $build  @return T */
    public function remember(string $key, Closure $build): mixed
    {
        return $this->store->rememberForever(self::PREFIX.$key, $build);
    }

    public function flush(): void
    {
        if ($this->paused) {
            return;
        }
        foreach (self::KEYS as $key) {
            $this->store->forget(self::PREFIX.$key);
        }
    }

    /**
     * يعلّق الإبطال أثناء عملية جماعية (كالاستيراد) ثم يُبطل مرّة واحدة
     * في آخرها — بدل مئات عمليات الحذف من المخبأ.
     *
     * @template T  @param Closure(): T $work  @return T
     */
    public function batch(Closure $work): mixed
    {
        $this->paused = true;
        try {
            return $work();
        } finally {
            $this->paused = false;
            $this->flush();
        }
    }
}
