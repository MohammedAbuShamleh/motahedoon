<?php

namespace App\Http\Requests\Admin;

final class SiteSettingRequest extends AdminRequest
{
    public const TRANSLATABLE = ['name', 'short_name', 'tagline', 'media_office', 'vision', 'mission', 'unapproved_notice'];

    public function rules(): array
    {
        // روابط التواصل الاجتماعي صارت صفحة مستقلّة (SocialLinkController)
        return [
            'name' => ['required', 'string', 'max:255'],
            'short_name' => ['required', 'string', 'max:120'],
            'tagline' => ['required', 'string', 'max:512'],
            'vision' => ['required', 'string'],
            'mission' => ['required', 'string'],
            'founding_year' => ['nullable', 'string', 'max:16'],
            'media_office' => ['required', 'string', 'max:255'],
            'governance' => ['nullable', 'string'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:64'],
            'contact_address' => ['nullable', 'string', 'max:512'],
            'donate_url' => ['nullable', 'url', 'max:512'],
            'donate_label' => ['required', 'string', 'max:255'],
            'home_metrics_count' => ['required', 'integer', 'min:0', 'max:12'],
            ...$this->imageRules('logo_full', 4096),
            ...$this->imageRules('logo_mark', 4096),
            ...$this->imageRules('donate_qr', 4096),
            ...$this->translationRules(self::TRANSLATABLE),
        ];
    }
}
