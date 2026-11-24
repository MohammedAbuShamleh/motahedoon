<?php

namespace App\Http;

use App\Http\Middleware\HandleInertiaRequests;
use App\Services\BuildMeta;
use App\Services\SiteContent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * صفحات الخطأ بلغة الموقع: صفحة الموقع (Error) أو صفحة اللوحة (Admin/Error)
 * حسب المسار. وإن عجزت هي نفسها — القاعدة متوقّفة، أو الخطأ وقع قبل الجلسة —
 * تُرسم صفحة ثابتة مستقلّة (errors/fallback) فلا يرى الزائر صفحة الإطار.
 */
final class ErrorPage
{
    public const STATUSES = [403, 404, 419, 429, 500, 503];

    /** عنوان الصفحة (وسم <title>) لكلّ رمز — مفاتيح ui_strings نفسها التي تعرضها الصفحة */
    private const TITLES = [
        403 => 'لا تملك صلاحية الوصول إلى هذه الصفحة',
        404 => 'هذه الصفحة غير موجودة',
        419 => 'انتهت صلاحية الصفحة',
        429 => 'طلبات كثيرة في وقت قصير',
        500 => 'حدث خطأ غير متوقّع',
        503 => 'الموقع قيد الصيانة',
    ];

    public static function render(Request $request, int $status): Response
    {
        try {
            $response = $request->is('admin', 'admin/*')
                ? self::admin($request, $status)
                : self::site($request, $status);
        } catch (Throwable) {
            return response()->view('errors.fallback', ['status' => $status], $status);
        }

        return $response->setStatusCode($status);
    }

    private static function admin(Request $request, int $status): Response
    {
        Inertia::setRootView('admin');

        return Inertia::render('Admin/Error', ['status' => $status])->toResponse($request);
    }

    private static function site(Request $request, int $status): Response
    {
        Inertia::setRootView('site');

        // خطأ قبل وسيط Inertia: ما تحتاجه الترويسة والتذييل لم يُشارَك بعد
        if (! array_key_exists('ui', Inertia::getShared())) {
            Inertia::share(app(HandleInertiaRequests::class)->share($request));
        }

        $content = app(SiteContent::class);
        $title = $content->ui()[self::TITLES[$status]] ?? self::TITLES[$status];

        return Inertia::render('Error', [
            'status' => $status,
            'pillars' => collect($content->get('pillars'))
                ->map(fn (array $p) => ['id' => $p['id'], 'short' => $p['short']])->all(),
        ])
            ->withViewData(['meta' => app(BuildMeta::class)($title)])
            ->toResponse($request);
    }
}
