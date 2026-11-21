<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

final class ReportSectionStoreRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'pillar_id' => [
                'required', 'integer', 'exists:pillars,id',
                // قسم واحد لكل مجال في التقرير — قيد المخطط نفسه
                Rule::unique('report_sections')->where('report_id', $this->route('report')->id),
            ],
        ];
    }

    public function messages(): array
    {
        return ['pillar_id.unique' => 'لهذا المجال قسم في التقرير سلفاً.'];
    }
}
