<?php

namespace App\Http\Requests\Admin;

final class MediaStoreRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'min:1', 'max:20'],
            'files.*' => ['file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:20480'],
            'bw' => ['required', 'boolean'],
        ];
    }
}
