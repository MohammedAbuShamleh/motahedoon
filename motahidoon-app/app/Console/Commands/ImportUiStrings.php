<?php

namespace App\Console\Commands;

use App\Enums\TranslationStatus;
use App\Models\UiString;
use App\Services\Content\ContentCache;
use App\Services\JsonContentSource;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * يستورد نصوص الواجهة (ui) من ملفات الترجمة إلى جدول ui_strings.
 *
 * جدول ui_strings أُضيف بعد الاستيراد الأول، فبقي فارغاً في القواعد
 * القائمة — ومن ثَمّ بقيت الترويسة والعناوين والأزرار عربية في كل لغة.
 * ContentSeeder لا يعمل فوق محتوى قائم (حمايةً لتحرير اللوحة)، فهذا
 * الأمر يملأ الفراغ وحده: يضيف المفتاح الناقص والترجمة الناقصة، ولا
 * يمسّ ترجمة موجودة إلا مع --force.
 */
final class ImportUiStrings extends Command
{
    protected $signature = 'content:import-ui {--force : استبدال الترجمات الموجودة بما في ملفات JSON}';

    protected $description = 'استورد نصوص الواجهة المترجمة من resources/content إلى ui_strings';

    public function handle(ContentCache $cache): int
    {
        $json = new JsonContentSource(resource_path('content'));
        $force = (bool) $this->option('force');
        $added = 0;
        $skipped = 0;

        // دالة عادية لا سهمية: السهمية تلتقط بالقيمة فتضيع مراجع العدّادات
        $cache->batch(function () use ($json, $force, &$added, &$skipped): void {
            DB::transaction(function () use ($json, $force, &$added, &$skipped): void {
            $pos = (int) UiString::query()->max('position');

            foreach (['en', 'tr'] as $locale) {
                foreach ($json->overlay($locale)['ui'] ?? [] as $key => $value) {
                    if (! is_string($value) || $value === '') {
                        continue;
                    }
                    $ui = UiString::query()->firstOrCreate(['key' => $key], ['position' => ++$pos]);
                    $existing = $ui->translations()->where('field', 'value')->where('locale', $locale)->first();

                    if ($existing !== null && ! $force) {
                        $skipped++;
                        continue;
                    }
                    $ui->translations()->updateOrCreate(
                        ['field' => 'value', 'locale' => $locale],
                        ['value' => $value, 'status' => TranslationStatus::Machine],
                    );
                    $added++;
                }
            }
            });
        });

        $this->info("✓ نصوص الواجهة: {$added} ترجمة كُتبت، {$skipped} موجودة تُركت.");

        return self::SUCCESS;
    }
}
