<?php

namespace App\Traits;

use App\Services\Content\ContentCache;

/**
 * أي كتابة في نموذج محتوى تُسقط شجرة المحتوى المخبّأة.
 *
 * الشجرة تُبنى من نحو عشرين جدولاً، فتُخبَّأ. والإبطال هنا موصول بكل
 * مسار كتابة بلا استثناء — حفظ أو حذف أي سجل — لا بتذكّر الخدمات له.
 */
trait FlushesContentCache
{
    public static function bootFlushesContentCache(): void
    {
        $flush = fn () => app(ContentCache::class)->flush();

        static::saved($flush);
        static::deleted($flush);
    }
}
