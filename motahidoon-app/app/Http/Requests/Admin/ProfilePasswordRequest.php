<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Validation\Rules\Password;

/** تغيير كلمة المرور: الحالية، ثم الجديدة مرّتين (10 أحرف على الأقل كبقية اللوحة). */
final class ProfilePasswordRequest extends AdminRequest
{
    protected function roles(): array
    {
        return UserRole::cases();
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'confirmed', 'different:current_password', Password::min(10)],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'اكتب كلمة المرور الحالية.',
            'current_password.current_password' => 'كلمة المرور الحالية غير صحيحة.',
            'password.required' => 'اكتب كلمة المرور الجديدة.',
            'password.confirmed' => 'تأكيد كلمة المرور لا يطابقها.',
            'password.different' => 'كلمة المرور الجديدة يجب أن تختلف عن الحالية.',
            'password.min' => 'كلمة المرور 10 أحرف على الأقل.',
        ];
    }
}
