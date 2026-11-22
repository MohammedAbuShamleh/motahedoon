<?php

namespace App\Http\Resources\Admin;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Video */
final class VideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $link = $this->resource->linked();
        $poster = $this->resource->relationLoaded('poster') ? $this->poster : null;

        return [
            ...$this->resource->only(['id', 'video_album_id', 'title', 'description', 'source', 'url', 'duration', 'position', 'is_featured', 'is_published']),
            'recorded_on' => $this->recorded_on?->toDateString(),
            'provider' => $link?->provider,
            'file' => $this->resource->relationLoaded('file') ? MediaResource::brief($this->file) : null,
            'poster' => MediaResource::brief($poster),
            // غلاف مرفوع، وإلا غلاف يوتيوب العام — للمعاينة في اللوحة
            'thumb' => $poster?->url() ?? $link?->thumbnail(),
            'translations' => $this->resource->relationLoaded('translations')
                ? Translations::of($this->resource, ['title', 'description']) : null,
        ];
    }
}
