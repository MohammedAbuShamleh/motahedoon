<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
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
        /* نبضات العدّ تُرسَل بـ navigator.sendBeacon الذي لا يحمل ترويسة CSRF؛
           النقطة تكتب عدّادات مجمّعة وحدها، ومحدودة المعدّل — فلا خطر فيها */
        $middleware->validateCsrfTokens(except: ['stats']);
        $middleware->redirectGuestsTo('/admin/login');
        $middleware->redirectUsersTo('/admin');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        /* صفحات الخطأ بلغة الموقع لا بصفحة الإطار: الموقع العام أو اللوحة حسب
           المسار، وصفحة ثابتة إن عجزتا (App\Http\ErrorPage). أخطاء الخادم في
           وضع التطوير (APP_DEBUG) تبقى بتقريرها المفصّل. */
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            $status = $response->getStatusCode();
            if (! in_array($status, \App\Http\ErrorPage::STATUSES, true) || $request->expectsJson()) {
                return $response;
            }
            if ($status === 500 && config('app.debug')) {
                return $response;
            }

            return \App\Http\ErrorPage::render($request, $status);
        });
    })->create();
