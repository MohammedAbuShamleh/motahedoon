<?php

namespace App\Services;

use App\Contracts\ContentSource;

/**
 * الشجرة المحلّية للطلب الحالي، تُبنى مرّة وتُعاد.
 *
 * singleton في الحاوية: الدمج يجري مرّة واحدة مهما تكرّر الطلب داخل
 * الـController والوسيط وقالب الجذر.
 */
final class SiteContent
{
    /** @var array<string,mixed>|null */
    private ?array $built = null;
    private ?string $builtFor = null;

    public function __construct(
        private readonly ContentSource $source,
        private readonly LocalizeContent $localize,
    ) {}

    /** @return array<string,mixed> */
    public function all(): array
    {
        $locale = app()->getLocale();

        if ($this->built === null || $this->builtFor !== $locale) {
            $this->built = ($this->localize)(
                $this->source->base(),
                $this->source->overlay($locale),
            );
            $this->builtFor = $locale;
        }

        return $this->built;
    }

    /** @return array<string,mixed> */
    public function get(string $key): mixed
    {
        return data_get($this->all(), $key);
    }

    /** خريطة نصوص الواجهة للّغة النشطة؛ فارغة للعربية. @return array<string,string> */
    public function ui(): array
    {
        return $this->source->overlay(app()->getLocale())['ui'] ?? [];
    }

    /** نصّ تنويه «ترجمة غير معتمدة»، أو null للعربية. */
    public function unapprovedNotice(): ?string
    {
        return $this->source->overlay(app()->getLocale())['unapproved'] ?? null;
    }
}
