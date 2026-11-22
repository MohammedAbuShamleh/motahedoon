<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

final class VideoAlbumRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'slug' => ['required', 'alpha_dash:ascii', 'max:64', Rule::unique('video_albums')->ignore($this->route('album'))],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'pillar_id' => ['nullable', 'integer', 'exists:pillars,id'],
            'position' => ['nullable', 'integer', 'min:1', 'max:65000'],
            'is_published' => ['required', 'boolean'],
            ...$this->imageRules('cover', 8192),
            ...$this->translationRules(['title', 'description'], 2000),
        ];
    }
}
