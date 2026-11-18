<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Validation\Rule;

final class UiStringRequest extends AdminRequest
{
    protected function roles(): array
    {
        return [UserRole::Admin, UserRole::Editor, UserRole::Translator];
    }

    public function rules(): array
    {
        return [
            // المفتاح هو النصّ العربي الذي يطلبه الكود؛ تغييره يقطع الصلة به
            'key' => [$this->isMethod('post') ? 'required' : 'prohibited', 'string', 'max:255', Rule::unique('ui_strings')],
            ...$this->translationRules(['value'], 1000),
        ];
    }
}
