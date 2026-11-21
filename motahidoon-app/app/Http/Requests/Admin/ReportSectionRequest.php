<?php

namespace App\Http\Requests\Admin;

final class ReportSectionRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'lead' => ['nullable', 'string'],

            'groups' => ['nullable', 'array'],
            'groups.*.id' => ['nullable', 'integer'],
            'groups.*.num' => ['nullable', 'string', 'max:8'],
            'groups.*.title' => ['nullable', 'string', 'max:512'],
            'groups.*.is_recap' => ['nullable', 'boolean'],
            'groups.*.items' => ['nullable', 'array'],
            'groups.*.items.*.id' => ['nullable', 'integer'],
            'groups.*.items.*.term' => ['nullable', 'string', 'max:512'],
            'groups.*.items.*.body' => ['required', 'string'],
            'groups.*.items.*.is_recap' => ['nullable', 'boolean'],

            'blocks' => ['nullable', 'array'],
            'blocks.*.id' => ['nullable', 'integer'],
            'blocks.*.title' => ['required', 'string', 'max:512'],
            'blocks.*.note_term' => ['nullable', 'string', 'max:512'],
            'blocks.*.note_body' => ['nullable', 'string'],
            'blocks.*.figures' => ['nullable', 'array'],
            'blocks.*.figures.*.id' => ['nullable', 'integer'],
            'blocks.*.figures.*.value' => ['required', 'string', 'max:64'],
            'blocks.*.figures.*.prefix' => ['nullable', 'string', 'max:32'],
            'blocks.*.figures.*.unit' => ['nullable', 'string', 'max:64'],
            'blocks.*.figures.*.label' => ['required', 'string', 'max:512'],
            'blocks.*.figures.*.accent' => ['nullable', 'boolean'],

            ...TableRules::for('table'),

            'gallery' => ['nullable', 'array'],
            'gallery.*.id' => ['nullable', 'integer'],
            'gallery.*.media_id' => ['nullable', 'integer', 'exists:media,id'],
            'gallery.*.file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192', 'required_without:gallery.*.media_id'],
            'gallery.*.caption' => ['required', 'string', 'max:512'],

            ...$this->translationRules(['lead']),
        ];
    }
}
