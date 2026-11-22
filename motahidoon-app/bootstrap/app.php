<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            SetLocale::class,            // قبل Inertia: الوسيط يشارك اللغة
            HandleInertiaRequests::class,
        ]);
        $middleware->alias(['role' => \App\Http\Middleware\EnsureRole::class]);
        $middleware->redirectGuestsTo('/admin/login');
        $middleware->redirectUsersTo('/admin');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        /* 404 يُرسَم بصفحة الموقع لا بصفحة الإطار الافتراضية —
           كما كان renderNotFound() في الموقع الثابت. */
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if ($response->getStatusCode() !== 404 || $request->expectsJson()) {
                return $response;
            }

            /* مسار غير مسجَّل لا يمرّ بوسيط الويب، فلا يُضبط rootView
               من HandleInertiaRequests ويعود Inertia إلى 'app' غير الموجود. */
            Inertia::setRootView('site');

            return Inertia::render('NotFound', [
                'pillars' => collect(app(\App\Services\SiteContent::class)->get('pillars'))
                    ->map(fn (array $p) => ['id' => $p['id'], 'short' => $p['short']])->all(),
            ])
                ->withViewData(['meta' => app(\App\Services\BuildMeta::class)(
                    app(\App\Services\SiteContent::class)->ui()['هذه الصفحة غير موجودة']
                        ?? 'هذه الصفحة غير موجودة'
                )])
                ->toResponse($request)
                ->setStatusCode(404);
        });
    })->create();
