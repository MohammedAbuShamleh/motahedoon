<?php

namespace App\Http\Resources\Admin;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Media */
final class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'path' => $this->path,
            'mime' => $this->mime,
            'width' => $this->width,
            'height' => $this->height,
            'bytes' => $this->bytes,
            'is_bw' => $this->is_bw,
            'uploaded' => $this->isUploaded(),
        ];
    }

    /** صورة اختيارية بشكل مختصر لحقول النماذج. @return array{id: int, url: string}|null */
    public static function brief(?Media $media): ?array
    {
        return $media === null ? null : ['id' => $media->id, 'url' => $media->url()];
    }
}
