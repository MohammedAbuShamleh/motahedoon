<?php

namespace App\Http\Resources\Admin;

use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Partner */
final class PartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            ...$this->resource->only(['id', 'slug', 'name', 'site_url', 'role', 'about', 'position', 'is_published']),
            'logo' => MediaResource::brief($this->logo),
            'translations' => $this->resource->relationLoaded('translations')
                ? Translations::of($this->resource, ['name']) : null,
        ];
    }
}
