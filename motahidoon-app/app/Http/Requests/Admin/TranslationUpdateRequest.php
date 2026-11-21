<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;

final class TranslationUpdateRequest extends AdminRequest
{
    protected function roles(): array
    {
        return [UserRole::Admin, UserRole::Editor, UserRole::Translator];
    }

    public function rules(): array
    {
        return ['value' => ['required', 'string']];
    }
}
