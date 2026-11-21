<?php

namespace App\Http\Requests\Admin;

final class FieldPhotoStoreRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'photos' => ['required', 'array', 'min:1', 'max:20'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ];
    }
}
