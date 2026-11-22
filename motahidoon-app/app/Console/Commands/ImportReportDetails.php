<?php

namespace App\Console\Commands;

use App\Enums\TranslationStatus;
use App\Models\Report;
use App\Services\Content\ContentCache;
use App\Services\Content\TranslationImporter;
use App\Services\JsonContentSource;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * يستورد ترجمة «التفاصيل الكاملة» لأقسام التقارير من ملفات البذر
 * (reports.{slug}.sections.{pillar}.detail في site.{en,tr}.json) إلى جدول
 * translations بحالة machine — غير معتمدة حتى تُراجَع في اللوحة.
 *
 * ContentSeeder لا يعمل فوق محتوى قائم (حمايةً لتحرير اللوحة)، فهذا الأمر
 * يملأ الفراغ وحده: يضيف الناقص، ولا يمسّ ترجمة موجودة إلا مع --force.
 */
final class ImportReportDetails extends Command
{
    protected $signature = 'content:import-details {--force : استبدال الترجمات الموجودة بما في ملفات JSON}';

    protected $description = 'استورد ترجمة التفاصيل الكاملة لأقسام التقارير من resources/content';

    public function handle(ContentCache $cache): int
    {
        $json = new JsonContentSource(resource_path('content'));
        $force = (bool) $this->option('force');
        $added = 0;
        $skipped = 0;
        $missing = [];

        $reports = Report::query()->with('sections.pillar')->get()->keyBy('slug');

        // دالة عادية لا سهمية: السهمية تلتقط بالقيمة فتضيع مراجع العدّادات
        $cache->batch(function () use ($json, $force, $reports, &$added, &$skipped, &$missing): void {
            DB::transaction(function () use ($json, $force, $reports, &$added, &$skipped, &$missing): void {
                foreach (['en', 'tr'] as $locale) {
                    foreach ($json->overlay($locale)['reports'] ?? [] as $slug => $tr) {
                        $sections = $reports->get($slug)?->sections->keyBy(fn ($s) => $s->pillar->slug);
                        foreach ($tr['sections'] ?? [] as $pillar => $ts) {
                            $value = TranslationImporter::encodeDetail($ts['detail'] ?? null);
                            if ($value === null) {
                                continue;
                            }
                            $section = $sections?->get($pillar);
                            if ($section === null) {
                                $missing[] = "{$locale}:{$slug}/{$pillar}";
                                continue;
                            }
                            $existing = $section->translations()
                                ->where('field', 'detail')->where('locale', $locale)->first();
                            if ($existing !== null && ! $force) {
                                $skipped++;
                                continue;
                            }
                            $section->translations()->updateOrCreate(
                                ['field' => 'detail', 'locale' => $locale],
                                ['value' => $value, 'status' => TranslationStatus::Machine],
                            );
                            $added++;
                        }
                    }
                }
            });
        });

        foreach ($missing as $m) {
            $this->warn("قسم غير موجود في القاعدة: {$m}");
        }
        $this->info("✓ التفاصيل الكاملة: {$added} ترجمة كُتبت، {$skipped} موجودة تُركت.");

        return self::SUCCESS;
    }
}
