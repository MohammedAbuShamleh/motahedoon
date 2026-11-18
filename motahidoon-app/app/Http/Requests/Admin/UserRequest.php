<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

final class UserRequest extends AdminRequest
{
    protected function roles(): array
    {
        return [UserRole::Admin];
    }

    public function rules(): array
    {
        $creating = $this->isMethod('post');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($this->route('user'))],
            'role' => ['required', Rule::enum(UserRole::class)],
            'password' => [$creating ? 'required' : 'nullable', 'string', Password::min(10)],
        ];
    }
}
