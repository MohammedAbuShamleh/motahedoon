<?php

namespace App\Http\Requests\Admin;

/** صورة تُدرَج داخل نصّ منسَّق من المحرّر. */
final class RichMediaRequest extends AdminRequest
{
    public function rules(): array
    {
        return ['file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192']];
    }
}
