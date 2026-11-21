<?php

namespace App\Http\Resources\Admin;

use App\Http\Requests\Admin\SiteSettingRequest;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin SiteSetting */
final class SiteSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            ...collect($this->resource->only([
                'name', 'short_name', 'tagline', 'vision', 'mission', 'founding_year', 'media_office',
                'governance', 'contact_email', 'contact_phone', 'contact_address', 'donate_url',
                'donate_label', 'home_metrics_count',
            ]))->all(),
            'social' => collect(SiteSetting::SOCIAL)->mapWithKeys(fn ($k) => [$k => $this->social[$k] ?? null])->all(),
            'logo_full' => MediaResource::brief($this->logoFull),
            'logo_mark' => MediaResource::brief($this->logoMark),
            'donate_qr' => MediaResource::brief($this->donateQr),
            'translations' => Translations::of($this->resource, SiteSettingRequest::TRANSLATABLE),
        ];
    }
}
