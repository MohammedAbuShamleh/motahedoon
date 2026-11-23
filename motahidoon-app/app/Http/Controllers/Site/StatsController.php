<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Middleware\SetLocale;
use App\Services\VisitStats;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * يستقبل نبضات العدّ من الواجهة (navigator.sendBeacon): مشاهدة صفحة، و/أو
 * أقسام ظهرت على الشاشة. لا يُرجع شيئاً (204)، ولا يفشل بصوت: إحصاءٌ ضائع
 * خير من خطأ يراه الزائر.
 */
final class StatsController extends Controller
{
    public function track(Request $request, VisitStats $stats): Response
    {
        if ($stats->isBot($request->userAgent())) {
            return response()->noContent();
        }

        $data = $request->validate([
            'path' => ['required', 'string', 'max:300'],
            'locale' => ['nullable', 'string', 'in:'.implode(',', SetLocale::LOCALES)],
            'view' => ['nullable', 'boolean'],
            'sections' => ['nullable', 'array', 'max:40'],
            'sections.*' => ['string', 'regex:/^[a-z0-9_-]{1,64}$/i'],
        ]);

        $path = $stats->normalize($data['path']);
        if ($path === null) {
            return response()->noContent();
        }

        if ($data['view'] ?? false) {
            // بصمة يومية مقطوعة لا تُعاد إلى صاحبها، تُفرَّغ بعد يومين
            $visitor = substr(hash('sha256', $request->ip().'|'.$request->userAgent().'|'.today()->toDateString().'|'.config('app.key')), 0, 16);
            $stats->pageView($path, $data['locale'] ?? 'ar', $visitor);
        }
        if (! empty($data['sections'])) {
            $stats->sectionViews($path, array_values(array_unique($data['sections'])));
        }

        return response()->noContent();
    }
}
