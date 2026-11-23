<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Validation\Rule;

/**
 * بيانات المستخدم نفسه: الاسم والبريد. تغيير البريد — وهو اسم الدخول —
 * يتطلّب كلمة المرور الحالية. متاح لكلّ الأدوار: كلٌّ يحرّر ملفّه وحده.
 */
final class ProfileRequest extends AdminRequest
{
    protected function roles(): array
    {
        return UserRole::cases();
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user?->id)],
            'current_password' => [
                Rule::requiredIf(fn () => $this->input('email') !== $user?->email),
                'nullable', 'current_password',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'هذا البريد مستعمل لحساب آخر.',
            'current_password.required' => 'لتغيير البريد اكتب كلمة المرور الحالية.',
            'current_password.current_password' => 'كلمة المرور الحالية غير صحيحة.',
        ];
    }
}
