<?php

namespace App\Http\Resources\Admin;

use App\Models\VideoAlbum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin VideoAlbum */
final class VideoAlbumResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $videos = $this->resource->relationLoaded('videos') ? $this->videos : null;

        return [
            ...$this->resource->only(['id', 'slug', 'title', 'description', 'pillar_id', 'position', 'is_published']),
            'cover' => MediaResource::brief($this->cover),
            'videos_count' => $this->videos_count ?? $videos?->count(),
            'videos' => $videos === null ? null : VideoResource::collection($videos)->resolve(),
            'translations' => $this->resource->relationLoaded('translations')
                ? Translations::of($this->resource, ['title', 'description']) : null,
        ];
    }
}
