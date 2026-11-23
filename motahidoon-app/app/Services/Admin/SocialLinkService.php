<?php

namespace App\Services\Admin;

use App\Enums\SocialIconStyle;
use App\Enums\SocialPlatform;
use App\Models\SiteSetting;
use App\Models\SocialLink;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class SocialLinkService
{
    /** ألوان الأيقونات القابلة للتخصيص (social_theme) */
    public const THEME_COLORS = ['icon', 'border', 'hover_icon', 'hover_border', 'hover_bg'];

    /** أثر المرور: default = أثر النمط نفسه */
    public const HOVER_EFFECTS = ['default', 'lift', 'grow', 'fill'];

    /** @return Collection<int, SocialLink> كلّ الروابط بترتيب العرض */
    public function listing(): Collection
    {
        return SocialLink::query()->ordered()->get();
    }

    /**
     * إضافة أو تعديل. المنصّة إن لم تُختر تُعرَف من نطاق الرابط، والاسم الظاهر
     * لا يُحفظ إلا لمنصّة «أخرى» (المعروفة تُعرض باسمها).
     *
     * @param array<string, mixed> $data
     */
    public function save(?SocialLink $link, array $data): SocialLink
    {
        return DB::transaction(function () use ($link, $data): SocialLink {
            $platform = isset($data['platform']) && $data['platform'] !== ''
                ? SocialPlatform::from($data['platform'])
                : SocialPlatform::detect($data['url']);

            $link ??= new SocialLink;
            $link->fill([
                'platform' => $platform,
                'url' => $data['url'],
                'label' => $platform === SocialPlatform::Other ? ($data['label'] ?? null) : null,
                'is_published' => (bool) $data['is_published'],
                'position' => $data['position'] ?? $link->position,
            ])->save();

            return $link;
        });
    }

    public function delete(SocialLink $link): void
    {
        $link->delete();
    }

    /** إعداد العرض الحالي: الإظهار والنمط والألوان. @return array{social_enabled: bool, social_style: string, social_theme: array<string, string|null>} */
    public function display(): array
    {
        $s = SiteSetting::current();

        return [
            'social_enabled' => $s->social_enabled,
            'social_style' => $s->social_style->value,
            'social_theme' => self::theme($s->social_theme),
        ];
    }

    /**
     * الألوان وأثر المرور بمفاتيحها كلّها: ما لم يُضبط null (لون النمط نفسه)،
     * والأثر default. قيم خارج الصيغة تُسقط — فلا يصل إلى CSS إلا لون صحيح.
     *
     * @param  array<string, mixed>|null  $raw
     * @return array<string, string|null>
     */
    public static function theme(?array $raw): array
    {
        $out = [];
        foreach (self::THEME_COLORS as $k) {
            $v = $raw[$k] ?? null;
            $out[$k] = is_string($v) && preg_match('/^#[0-9A-Fa-f]{6}$/', $v) ? strtoupper($v) : null;
        }
        $effect = $raw['hover_effect'] ?? 'default';
        $out['hover_effect'] = in_array($effect, self::HOVER_EFFECTS, true) ? $effect : 'default';

        return $out;
    }

    /** @param array{social_enabled: bool, social_style: string, social_theme?: array<string, mixed>|null} $data */
    public function updateDisplay(array $data): void
    {
        SiteSetting::current()->update([
            'social_enabled' => (bool) $data['social_enabled'],
            'social_style' => SocialIconStyle::from($data['social_style']),
            'social_theme' => self::theme($data['social_theme'] ?? null),
        ]);
    }

    /**
     * ما يحتاجه التذييل: هل يظهر القسم، وبأيّ نمط، والروابط المنشورة بترتيبها.
     * القسم المُطفأ لا يرسل روابطه أصلاً.
     *
     * @return array{enabled: bool, style: string, links: list<array{platform: string, url: string, label: string|null}>}
     */
    public static function forFooter(): array
    {
        $s = SiteSetting::query()->first();
        $enabled = $s?->social_enabled ?? true;

        return [
            'enabled' => $enabled,
            'style' => $s?->social_style?->value ?? SocialIconStyle::Outline->value,
            'theme' => self::theme($s?->social_theme),
            'links' => ! $enabled ? [] : SocialLink::query()->where('is_published', true)->ordered()->get()
                ->map(fn (SocialLink $l) => ['platform' => $l->platform->value, 'url' => $l->url, 'label' => $l->label])
                ->all(),
        ];
    }
}
