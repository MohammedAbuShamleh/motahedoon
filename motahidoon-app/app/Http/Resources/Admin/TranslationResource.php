<?php

namespace App\Http\Resources\Admin;

use App\Models\Translation;
use App\Services\Admin\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Translation */
final class TranslationResource extends JsonResource
{
    /** تسميات أنواع السجلات في صفحة «مراجعة الترجمات» — بلغة المحرّر لا بمصطلحات البنية. */
    public const TYPES = [
        'site_setting' => 'بيانات التجمّع',
        'content_line' => 'نصوص التعريف',
        'partner' => 'مؤسسة شريكة',
        'pillar' => 'مجال عمل',
        'report' => 'تقرير',
        'report_line' => 'فقرة تقرير',
        'report_metric' => 'مؤشّر تقرير',
        'report_section' => 'قسم تقرير',
        'ui_string' => 'زرّ أو عنوان',
    ];

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => self::TYPES[$this->translatable_type] ?? $this->translatable_type,
            'field' => $this->field,
            'locale' => $this->locale->value,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'value' => $this->value,
            'source' => app(TranslationService::class)->source($this->resource),
        ];
    }
}
