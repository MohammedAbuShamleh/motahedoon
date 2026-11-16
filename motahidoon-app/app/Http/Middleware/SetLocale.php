<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * اللغة من ?lang= أولاً، ثم من الجلسة، وإلا العربية.
 *
 * الموقع الثابت كان يحفظها في localStorage. هنا الجلسة، لأن الخادم
 * يرسم وسوم meta ويحتاج معرفة اللغة قبل أن يصل أي جافاسكربت.
 */
final class SetLocale
{
    public const LOCALES = ['ar', 'en', 'tr'];

    public function handle(Request $request, Closure $next): Response
    {
        $q = $request->query('lang');

        if (is_string($q) && in_array($q, self::LOCALES, true)) {
            $locale = $q;
            $request->session()->put('locale', $locale);
        } else {
            $stored = $request->session()->get('locale');
            $locale = in_array($stored, self::LOCALES, true) ? $stored : 'ar';
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
