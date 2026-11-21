<?php

namespace App\Enums;

/** مجموعات أسطر التقرير — القيم مطابقة لعمود report_lines.group. */
enum ReportLineGroup: string
{
    case Notice = 'notice';
    case Intro = 'intro';
    case Highlight = 'highlight';
    case Reading = 'reading';
    case DataNote = 'data_note';
    case Opportunity = 'opportunity';
    case ClosingParagraph = 'closing_paragraph';
    case AppealItem = 'appeal_item';

    public function label(): string
    {
        return match ($this) {
            self::Notice => 'تنويه',
            self::Intro => 'المقدّمة',
            self::Highlight => 'أبرز النقاط',
            self::Reading => 'قراءة الأثر',
            self::DataNote => 'ملاحظات البيانات',
            self::Opportunity => 'فرص التطوير',
            self::ClosingParagraph => 'فقرات الخاتمة',
            self::AppealItem => 'بنود نداء الدعم',
        };
    }

    public function hasTerm(): bool
    {
        return in_array($this, [self::Reading, self::DataNote], true);
    }
}
