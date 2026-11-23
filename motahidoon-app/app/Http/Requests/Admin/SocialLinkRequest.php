<?php

namespace App\Http\Requests\Admin;

use App\Enums\SocialPlatform;
use Illuminate\Validation\Rule;

final class SocialLinkRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'url' => ['required', 'url:http,https', 'max:512'],
            // فارغة = تُعرَف من الرابط
            'platform' => ['nullable', Rule::enum(SocialPlatform::class)],
            // اسم «المنصّة الأخرى» لازم، فلا يظهر في التذييل رابط بلا اسم
            'label' => ['nullable', 'string', 'max:120', 'required_if:platform,other'],
            'position' => ['nullable', 'integer', 'min:1', 'max:65000'],
            'is_published' => ['required', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return ['url' => 'الرابط', 'platform' => 'المنصّة', 'label' => 'الاسم الظاهر', 'position' => 'الترتيب'];
    }
}
