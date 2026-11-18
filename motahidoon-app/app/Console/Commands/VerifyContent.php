<?php

namespace App\Console\Commands;

use App\Services\Content\EloquentContentSource;
use App\Services\JsonContentSource;
use Illuminate\Console\Command;

/**
 * بوّابة الترحيل: يقارن ما تبنيه القاعدة بما في ملفات JSON المصدر،
 * للشجرة العربية ولكل طبقة ترجمة. أي اختلاف = الترحيل فاشل.
 *
 * يكمّل tools/verify-strings.js (الذي يقارن المرسوم فعلاً في المتصفّح)
 * ولا يغني عنه.
 */
final class VerifyContent extends Command
{
    protected $signature = 'content:verify';

    protected $description = 'قارن شجرة المحتوى المبنية من القاعدة بملفات JSON المصدر';

    public function handle(EloquentContentSource $db): int
    {
        $json = new JsonContentSource(resource_path('content'));
        $failed = false;

        $pairs = ['ar' => [$json->base(), $db->base()]];
        foreach (['en', 'tr'] as $locale) {
            $pairs[$locale] = [$json->overlay($locale), $db->overlay($locale)];
        }

        foreach ($pairs as $name => [$expected, $actual]) {
            $diffs = [];
            $this->compare($expected, $actual, $name, $diffs);
            if ($diffs === []) {
                $this->info("✓ {$name}: مطابق");
                continue;
            }
            $failed = true;
            $this->error("✗ {$name}: ".count($diffs).' اختلاف');
            foreach (array_slice($diffs, 0, 25) as $d) {
                $this->line("   {$d}");
            }
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }

    /** مقارنة عميقة: ترتيب القوائم مُلزِم، ترتيب مفاتيح الكائنات لا. @param list<string> $diffs */
    private function compare(mixed $a, mixed $b, string $path, array &$diffs): void
    {
        if (is_array($a) && is_array($b)) {
            foreach (array_unique([...array_keys($a), ...array_keys($b)]) as $k) {
                if (! array_key_exists($k, $a)) {
                    $diffs[] = "{$path}.{$k}: زائد في القاعدة";
                } elseif (! array_key_exists($k, $b)) {
                    $diffs[] = "{$path}.{$k}: مفقود من القاعدة";
                } else {
                    $this->compare($a[$k], $b[$k], "{$path}.{$k}", $diffs);
                }
            }

            return;
        }
        if ($a !== $b) {
            $diffs[] = "{$path}: ".json_encode($a, JSON_UNESCAPED_UNICODE).' ≠ '.json_encode($b, JSON_UNESCAPED_UNICODE);
        }
    }
}
