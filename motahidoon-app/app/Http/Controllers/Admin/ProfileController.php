<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProfilePasswordRequest;
use App\Http\Requests\Admin\ProfileRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** الملف الشخصي للمستخدم الحالي — كلّ الأدوار، ولا يمسّ الدور نفسه. */
final class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('Admin/Profile/Edit', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->label(),
                'since' => $user->created_at?->toDateString(),
            ],
            // للمدير: اختصار إلى إدارة المستخدمين وعددهم
            'users' => $user->role === UserRole::Admin ? User::query()->count() : null,
        ]);
    }

    public function update(ProfileRequest $request): RedirectResponse
    {
        $request->user()->update($request->safe()->only(['name', 'email']));

        return back()->with('success', 'تم حفظ بياناتك.');
    }

    public function password(ProfilePasswordRequest $request): RedirectResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);   // يُجزَّأ بالـcast
        // جلسة جديدة بعد تغيير كلمة المرور، فلا يُعاد استعمال معرّف الجلسة القديم
        $request->session()->regenerate();

        return back()->with('success', 'تم تغيير كلمة المرور.');
    }
}
