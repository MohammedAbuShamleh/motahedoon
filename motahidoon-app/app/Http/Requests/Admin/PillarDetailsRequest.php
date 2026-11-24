<?php

namespace App\Http\Requests\Admin;

/** التعريف الدائم للمجال وترجمتاه — نصّ منسَّق. الفارغ يبقى null: «بانتظار اعتماد التجمع». */
final class PillarDetailsRequest extends AdminRequest
{
    public const TRANSLATABLE = ['definition'];

    protected function richFields(): array
    {
        return ['definition', 'translations.*.definition'];
    }

    public function rules(): array
    {
        return [
            'definition' => ['nullable', 'string', 'max:'.ReportSectionRequest::RICH_MAX],
            ...$this->translationRules(self::TRANSLATABLE, ReportSectionRequest::RICH_MAX),
        ];
    }
}
