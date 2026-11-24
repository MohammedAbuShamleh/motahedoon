<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

final class PillarRequest extends AdminRequest
{
    /** التعريف يُحرَّر في صفحة تفاصيل المجال (PillarDetailsRequest) لا هنا */
    public const TRANSLATABLE = ['title', 'short', 'cover_caption', 'orgs'];

    public function rules(): array
    {
        return [
            'slug' => ['required', 'alpha_dash:ascii', 'max:64', Rule::unique('pillars')->ignore($this->route('pillar'))],
            'num' => ['nullable', 'string', 'max:8'],   // فارغ = التالي تلقائياً
            'title' => ['required', 'string', 'max:512'],
            'short' => ['required', 'string', 'max:255'],
            'orgs' => ['required', 'string', 'max:512'],
            'cover_caption' => ['nullable', 'string', 'max:512'],
            'position' => ['nullable', 'integer', 'min:1', 'max:65000'],
            'is_published' => ['required', 'boolean'],
            ...$this->imageRules('cover'),
            ...$this->translationRules(self::TRANSLATABLE),
        ];
    }
}
