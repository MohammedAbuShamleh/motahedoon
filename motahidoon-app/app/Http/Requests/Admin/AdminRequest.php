<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

/**
 * أساس طلبات اللوحة: التفويض هنا لا في الـController.
 * الطلب الذي يحتاج أدواراً غير «مدير ومحرّر» يعيد تعريف roles().
 */
abstract class AdminRequest extends FormRequest
{
    /** @return list<UserRole> */
    protected function roles(): array
    {
        return [UserRole::Admin, UserRole::Editor];
    }

    public function authorize(): bool
    {
        return (bool) $this->user()?->hasRole(...$this->roles());
    }

    /** قواعد حقول الترجمة: translations[en|tr][field]. @param list<string> $fields */
    protected function translationRules(array $fields, int $max = 65535): array
    {
        $rules = ['translations' => ['nullable', 'array:en,tr']];
        foreach (['en', 'tr'] as $locale) {
            $rules["translations.{$locale}"] = ['nullable', 'array:'.implode(',', $fields)];
            foreach ($fields as $field) {
                $rules["translations.{$locale}.{$field}"] = ['nullable', 'string', "max:{$max}"];
            }
        }

        return $rules;
    }

    /** صورة اختيارية مع خيار إزالتها. */
    protected function imageRules(string $field, int $kb = 8192): array
    {
        return [
            $field => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', "max:{$kb}"],
            "remove_{$field}" => ['nullable', 'boolean'],
        ];
    }
}
