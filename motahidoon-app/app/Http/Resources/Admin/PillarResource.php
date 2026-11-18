<?php

namespace App\Http\Resources\Admin;

use App\Http\Requests\Admin\PillarRequest;
use App\Models\Pillar;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Pillar */
final class PillarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            ...$this->resource->only([
                'id', 'slug', 'num', 'title', 'short', 'orgs', 'definition', 'cover_caption', 'position', 'is_published',
            ]),
            'cover' => MediaResource::brief($this->cover),
            'translations' => $this->resource->relationLoaded('translations')
                ? Translations::of($this->resource, PillarRequest::TRANSLATABLE) : null,
        ];
    }
}
