<?php

namespace App\Http\Resources\Admin;

use App\Models\ContentLine;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ContentLine */
final class ContentLineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group' => $this->group->value,
            'term' => $this->term,
            'body' => $this->body,
            'position' => $this->position,
            'translations' => Translations::of($this->resource, ['term', 'body']),
        ];
    }
}
