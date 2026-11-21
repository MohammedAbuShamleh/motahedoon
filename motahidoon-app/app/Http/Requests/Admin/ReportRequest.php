<?php

namespace App\Http\Requests\Admin;

use App\Enums\ReportLineGroup;
use App\Enums\ReportStatus;
use Illuminate\Validation\Rule;

/**
 * التقرير ومكوّناته غير المرتبطة بمجال: الأسطر بأنواعها، والمؤشّرات،
 * وجدول الملخّص، ونداء الدعم. أقسام المجالات لها طلبها.
 */
final class ReportRequest extends AdminRequest
{
    public const TRANSLATABLE = ['label', 'range', 'report_title', 'metrics_title'];

    public function rules(): array
    {
        $groups = implode(',', array_column(ReportLineGroup::cases(), 'value'));

        return [
            'slug' => ['required', 'alpha_dash:ascii', 'max:64', Rule::unique('reports')->ignore($this->route('report'))],
            'label' => ['required', 'string', 'max:120'],
            'range' => ['required', 'string', 'max:255'],
            'report_title' => ['required', 'string', 'max:512'],
            'metrics_title' => ['required', 'string', 'max:512'],
            'status' => ['required', Rule::enum(ReportStatus::class)],
            'is_current' => ['required', 'boolean'],
            'reading_title' => ['nullable', 'string', 'max:512'],
            'data_notes_title' => ['nullable', 'string', 'max:512'],
            'opportunities_title' => ['nullable', 'string', 'max:512'],
            'closing_title' => ['nullable', 'string', 'max:512'],
            'closing_signoff' => ['nullable', 'string', 'max:512'],
            'appeal_title' => ['nullable', 'string', 'max:512'],
            'appeal_lead' => ['nullable', 'string'],
            'appeal_photo_caption' => ['nullable', 'string', 'max:512'],
            ...$this->imageRules('appeal_photo'),
            'report_file' => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
            'remove_report_file' => ['nullable', 'boolean'],

            'lines' => ['nullable', "array:{$groups}"],
            'lines.*' => ['array'],
            'lines.*.*.id' => ['nullable', 'integer'],
            'lines.*.*.term' => ['nullable', 'string', 'max:512'],
            'lines.*.*.body' => ['required', 'string'],

            // القيمة نصّ كما كُتبت — لا numeric: «12,013,597» تبقى بفاصلتها
            'metrics' => ['nullable', 'array'],
            'metrics.*.id' => ['nullable', 'integer'],
            'metrics.*.value' => ['required', 'string', 'max:64'],
            'metrics.*.prefix' => ['nullable', 'string', 'max:32'],
            'metrics.*.unit' => ['nullable', 'string', 'max:64'],
            'metrics.*.label' => ['required', 'string', 'max:512'],
            'metrics.*.accent' => ['nullable', 'boolean'],

            ...TableRules::for('summary'),
            ...$this->translationRules(self::TRANSLATABLE, 512),
        ];
    }
}
