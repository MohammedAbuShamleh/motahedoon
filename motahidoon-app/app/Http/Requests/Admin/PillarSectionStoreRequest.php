<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

/** إضافة المجال إلى تقرير من صفحة تفاصيله: قسم واحد لكل مجال في التقرير. */
final class PillarSectionStoreRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'report_id' => [
                'required', 'integer', 'exists:reports,id',
                Rule::unique('report_sections')->where('pillar_id', $this->route('pillar')->id),
            ],
        ];
    }

    public function messages(): array
    {
        return ['report_id.unique' => 'لهذا المجال قسم في هذا التقرير سلفاً.'];
    }
}
