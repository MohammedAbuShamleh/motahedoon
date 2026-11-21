<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentLineGroup;
use Illuminate\Validation\Rule;

final class ContentLineRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'group' => [$this->isMethod('post') ? 'required' : 'prohibited', Rule::enum(ContentLineGroup::class)],
            'term' => ['nullable', 'string', 'max:512'],
            'body' => ['required', 'string'],
            'position' => ['nullable', 'integer', 'min:1', 'max:65000'],
            ...$this->translationRules(['term', 'body']),
        ];
    }
}
