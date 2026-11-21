<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

final class PartnerRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'slug' => ['required', 'alpha_dash:ascii', 'max:64', Rule::unique('partners')->ignore($this->route('partner'))],
            'name' => ['required', 'string', 'max:255'],
            'site_url' => ['nullable', 'url', 'max:512'],
            'role' => ['nullable', 'string', 'max:512'],
            'about' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:1', 'max:65000'],
            'is_published' => ['required', 'boolean'],
            ...$this->imageRules('logo', 4096),
            ...$this->translationRules(['name'], 255),
        ];
    }
}
