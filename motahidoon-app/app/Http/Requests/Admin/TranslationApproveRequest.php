<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;

/** الاعتماد للمدير وحده: من يترجم لا يعتمد ترجمته. */
final class TranslationApproveRequest extends AdminRequest
{
    protected function roles(): array
    {
        return [UserRole::Admin];
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:500'],
            'ids.*' => ['integer', 'exists:translations,id'],
        ];
    }
}
