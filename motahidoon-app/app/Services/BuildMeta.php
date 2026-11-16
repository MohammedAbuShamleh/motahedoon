<?php

namespace App\Services;

use App\Http\Middleware\SetLocale;

/**
 * وسوم الرأس، تُرسَم خادمياً في قالب site.blade.php.
 *
 * الوصف العربي منقول حرفياً عن index.html الثابت. في اللغات الأخرى
 * يُستعمل شعار التجمّع المترجَم بدل الوصف العربي — فقاعدة «لا خلط
 * للّغات» تسري على وسوم الرأس كما تسري على المتن.
 */
final class BuildMeta
{
    private const AR_DESCRIPTION = 'تجمع متحدون من أجل غزة: مظلة تضم مؤسسات خيرية ودعوية وتعليمية عاملة في قطاع غزة. المؤسسات الشريكة ومجالات العمل والتقارير الدورية.';

    private const OG_LOCALE = ['ar' => 'ar_AR', 'en' => 'en_US', 'tr' => 'tr_TR'];

    public function __construct(private readonly SiteContent $content) {}

    /** @return array<string,mixed> */
    public function __invoke(?string $pageTitle = null): array
    {
        $locale = app()->getLocale();
        $org = $this->content->get('org');
        $name = $org['name'];

        return [
            'lang'        => $locale,
            'dir'         => $locale === 'ar' ? 'rtl' : 'ltr',
            'title'       => $pageTitle ? "{$pageTitle} — {$name}" : $name,
            'description' => $locale === 'ar' ? self::AR_DESCRIPTION : $org['tagline'],
            'image'       => $org['logoFull'],
            'ogLocale'    => self::OG_LOCALE[$locale] ?? 'ar_AR',
            'canonical'   => url()->current().'?lang='.$locale,
            'alternates'  => collect(SetLocale::LOCALES)
                ->mapWithKeys(fn (string $c) => [$c => url()->current().'?lang='.$c])
                ->all(),
        ];
    }
}

