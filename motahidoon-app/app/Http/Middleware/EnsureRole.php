<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** يحصر المسار في أدوار بعينها: ->middleware('role:admin,editor'). */
final class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowed = array_map(fn (string $r) => UserRole::from($r), $roles);

        abort_unless($user !== null && $user->hasRole(...$allowed), 403, 'لا صلاحية لك على هذه الصفحة.');

        return $next($request);
    }
}
