<?php

namespace App\Http\Requests\Admin;

use App\Enums\SocialIconStyle;
use App\Services\Admin\SocialLinkService;
use Illuminate\Validation\Rule;

/** إعداد عرض روابط التواصل: إظهارها، ونمط أيقوناتها، وألوانها وأثر المرور. */
final class SocialDisplayRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'social_enabled' => ['required', 'boolean'],
            'social_style' => ['required', Rule::enum(SocialIconStyle::class)],
            // كلّ لون اختياري: الفارغ = لون النمط نفسه
            'social_theme' => ['nullable', 'array:icon,border,hover_icon,hover_border,hover_bg,hover_effect'],
            ...collect(SocialLinkService::THEME_COLORS)->mapWithKeys(fn (string $k) => [
                "social_theme.{$k}" => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            ])->all(),
            'social_theme.hover_effect' => ['nullable', Rule::in(SocialLinkService::HOVER_EFFECTS)],
        ];
    }

    public function messages(): array
    {
        return ['social_theme.*.regex' => 'اللون يجب أن يكون بصيغة #RRGGBB.'];
    }
}
