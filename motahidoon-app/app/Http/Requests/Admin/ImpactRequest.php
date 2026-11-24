<?php

namespace App\Http\Requests\Admin;

/**
 * «الإنجازات والأثر»: شريحة من التقرير وحدها — المؤشّرات (لمحة أثر في
 * الرئيسية وشريحة الأرقام في صفحة التقرير)، وأبرز الإنجازات، وقراءة الأثر،
 * وعدد الأرقام الظاهرة في الرئيسية. باقي التقرير لا يُمسّ من هنا.
 */
final class ImpactRequest extends AdminRequest
{
    /** حقول التقرير المترجَمة من هنا. metrics_title مشترك مع نموذج التقرير الكامل. */
    public const TRANSLATABLE = ['metrics_title', 'reading_title'];

    public function rules(): array
    {
        return [
            ...$this->translationRules(self::TRANSLATABLE, 512),
            ...$this->childTranslationRules('metrics', ['label', 'unit']),
            ...$this->childTranslationRules('highlight', ['body']),
            ...$this->childTranslationRules('reading', ['term', 'body']),

            'home_metrics_count' => ['required', 'integer', 'min:0', 'max:12'],
            'metrics_title' => ['required', 'string', 'max:512'],
            'reading_title' => ['nullable', 'string', 'max:512'],

            // القيمة نصّ كما كُتبت — لا numeric: «12,013,597» تبقى بفاصلتها
            'metrics' => ['nullable', 'array'],
            'metrics.*.id' => ['nullable', 'integer'],
            'metrics.*.value' => ['required', 'string', 'max:64'],
            'metrics.*.prefix' => ['nullable', 'string', 'max:32'],
            'metrics.*.unit' => ['nullable', 'string', 'max:64'],
            'metrics.*.label' => ['required', 'string', 'max:512'],
            'metrics.*.accent' => ['nullable', 'boolean'],

            'highlight' => ['nullable', 'array'],
            'highlight.*.id' => ['nullable', 'integer'],
            'highlight.*.body' => ['required', 'string'],

            'reading' => ['nullable', 'array'],
            'reading.*.id' => ['nullable', 'integer'],
            'reading.*.term' => ['nullable', 'string', 'max:512'],
            'reading.*.body' => ['required', 'string'],
        ];
    }

    /** ترجمات كلّ بند في قائمة: list.*.translations[en|tr][field]. @param list<string> $fields */
    private function childTranslationRules(string $list, array $fields): array
    {
        $rules = ["{$list}.*.translations" => ['nullable', 'array:en,tr']];
        foreach (['en', 'tr'] as $locale) {
            $rules["{$list}.*.translations.{$locale}"] = ['nullable', 'array:'.implode(',', $fields)];
            foreach ($fields as $field) {
                $rules["{$list}.*.translations.{$locale}.{$field}"] = ['nullable', 'string', 'max:65535'];
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'metrics.*.value.required' => 'اكتب قيمة الرقم كما في المصدر.',
            'metrics.*.label.required' => 'اكتب وصف الرقم.',
            'highlight.*.body.required' => 'اكتب نصّ الإنجاز أو احذف البند.',
            'reading.*.body.required' => 'اكتب نصّ القراءة أو احذف البند.',
        ];
    }
}
