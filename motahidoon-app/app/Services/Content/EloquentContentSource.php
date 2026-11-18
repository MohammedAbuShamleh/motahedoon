<?php

namespace App\Services\Content;

use App\Contracts\ContentSource;

/**
 * مصدر المحتوى من MySQL — يحقّق العقد نفسه الذي حقّقه JsonContentSource،
 * فلا يتغيّر فوقه سطر: الـControllers والواجهة تتلقّى الشجرة ذاتها.
 *
 * البناء موزّع على بنّاءين (المتن، وطبقة الترجمة)، والنتيجة مخبّأة.
 */
final class EloquentContentSource implements ContentSource
{
    /** @var array<string, array|null> ذاكرة الطلب: SiteContent يسأل أكثر من مرّة */
    private array $memo = [];

    public function __construct(
        private readonly SiteTreeBuilder $tree,
        private readonly OverlayBuilder $overlays,
        private readonly ContentCache $cache,
    ) {}

    public function base(): array
    {
        return $this->memo['base'] ??= $this->cache->remember('base', fn () => $this->tree->build());
    }

    public function overlay(string $locale): ?array
    {
        if ($locale === 'ar') {
            return null;
        }

        return $this->memo["overlay.{$locale}"] ??= $this->cache->remember(
            "overlay.{$locale}",
            fn () => $this->overlays->build($locale),
        );
    }
}
