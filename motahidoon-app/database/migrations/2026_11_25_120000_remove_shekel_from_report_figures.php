<?php

use App\Services\Content\ContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * حذف كلمة العملة بعد الأرقام في نصوص التقرير (طلب صاحب المشروع 2026-11-25):
 * «152,607 شيكلًا» ← «152,607». الأرقام نفسها لا تُمسّ — تبقى حرفية كما في
 * المصدر؛ يُحذف لفظ العملة وحده، وفي الترجمتين معاً («ILS 152,607» و
 * «152,607 şekel») فلا تقول لغةٌ ما لا تقوله الأخرى.
 *
 * بيانات لا مخطّط: يُشغَّل على الخادم بـ migrate فلا يُعدَّل شيء يدوياً.
 * لا رجوع آلياً (down فارغ): النصّ الأصلي محفوظ في ملفات المحتوى في git.
 */
return new class extends Migration
{
    /** اللفظ بعد رقم: شيكل، شيكلًا، شيكلاً — بمسافته السابقة */
    private const AR = '/(?<=\d)\s*شيكل[\x{064B}\x{0627}]*/u';

    private const EN = '/\b(?:ILS|NIS|₪)\s*(?=\d)|(?<=\d)\s*(?:shekels?|ILS|NIS)\b/u';

    private const TR = '/(?<=\d)\s*şekel\b/u';

    public function up(): void
    {
        DB::transaction(function (): void {
            foreach ([['report_group_items', 'body'], ['report_lines', 'body'], ['report_sections', 'lead']] as [$table, $col]) {
                DB::table($table)->where($col, 'like', '%شيكل%')->get(['id', $col])
                    ->each(fn ($row) => DB::table($table)->where('id', $row->id)
                        ->update([$col => preg_replace(self::AR, '', $row->$col)]));
            }

            DB::table('translations')->whereIn('locale', ['en', 'tr'])
                ->where(fn ($q) => $q->where('value', 'like', '%ILS%')->orWhere('value', 'like', '%NIS%')
                    ->orWhere('value', 'like', '%shekel%')->orWhere('value', 'like', '%şekel%')->orWhere('value', 'like', '%₪%'))
                ->get(['id', 'locale', 'value'])
                ->each(function ($row): void {
                    $clean = preg_replace($row->locale === 'en' ? self::EN : self::TR, '', $row->value);
                    if ($clean !== $row->value) {
                        DB::table('translations')->where('id', $row->id)->update(['value' => $clean]);
                    }
                });
        });

        // الكتابة بالاستعلام لا بالنماذج: مخبأ المحتوى لا يُبطَل وحده
        app(ContentCache::class)->flush();
    }

    public function down(): void {}
};
