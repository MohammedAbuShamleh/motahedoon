<?php

namespace App\Http\Requests\Admin;

/** ترتيب جديد لقائمة: معرّفات بالترتيب المطلوب. */
final class ReorderRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct'],
        ];
    }
}
