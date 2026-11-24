<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Services\Content\RichText;
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

    /**
     * حقول النصّ المنسَّق بمسارات نقطية («*» لكل عنصر). تُنقّى في validated()
     * فلا يصل الخدمةَ HTML غير منقّى أيّاً كان من يستدعيها.
     *
     * @return list<string>
     */
    protected function richFields(): array
    {
        return [];
    }

    /** المحرّر الفارغ (<p></p>) يصير null قبل التحقّق، فتعمل required وتبقى الخانة المحجوزة. */
    protected function prepareForValidation(): void
    {
        $paths = $this->richFields();
        if ($paths === []) {
            return;
        }
        $mapped = RichText::mapPaths(
            $this->input(), $paths,
            fn (string $v) => RichText::isHtml($v) && RichText::isBlank($v) ? null : $v,
        );
        $roots = array_unique(array_map(fn (string $p) => explode('.', $p)[0], $paths));
        $this->merge(array_intersect_key($mapped, array_flip($roots)));
    }

    public function validated($key = null, $default = null): mixed
    {
        $data = RichText::mapPaths(parent::validated(), $this->richFields(), RichText::clean(...));

        return $key === null ? $data : data_get($data, $key, $default);
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
