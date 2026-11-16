<?php

namespace App\Services;

/**
 * دمج طبقة الترجمة فوق الشجرة العربية.
 *
 * نقل حرفي لـ localize() في app.js الثابت. ليس دمجاً عاماً مفتاح-بمفتاح:
 * فيه قواعد مقصودة تمنع خلط اللغتين في صفحة واحدة —
 *   · الأقسام السردية الطويلة التي لم تُترجَم بعد تُحذف من العرض الأجنبي
 *     بدل أن تظهر بالعربية داخل صفحة إنجليزية.
 *   · تقرير بلا ترجمة يُوسَم untranslated وتُفرَّغ أقسامه.
 *   · تعليق صورة الغلاف يسقط إلى تسمية عامة، لا إلى نصّه العربي.
 *
 * نُفّذ في الخادم لا المتصفّح لسببين: وسوم og: الخادمية تحتاج البيانات
 * المترجمة نفسها، وتنفيذٌ واحد خير من اثنين يتباعدان.
 */
final class LocalizeContent
{
    /**
     * @param  array<string,mixed>       $site     الشجرة العربية
     * @param  array<string,mixed>|null  $overlay  طبقة اللغة، أو null للعربية
     * @return array<string,mixed>
     */
    public function __invoke(array $site, ?array $overlay): array
    {
        if ($overlay === null) {
            return $site;
        }

        $t = $overlay;
        $s = $site;                       // PHP ينسخ المصفوفات بالقيمة
        $ui = fn (string $k): string => $t['ui'][$k] ?? $k;

        foreach (['org', 'identity'] as $key) {
            if (! empty($t[$key])) {
                $s[$key] = array_merge($s[$key], $t[$key]);
            }
        }
        foreach (['mediaOffice', 'intro', 'goals', 'aspirations', 'governance'] as $key) {
            if (! empty($t[$key])) {
                $s[$key] = $t[$key];
            }
        }
        if (! empty($t['founding']['story'])) {
            $s['founding']['story'] = $t['founding']['story'];
        }

        foreach ($s['partners'] as $i => $p) {
            if (! empty($t['partners'][$p['id']])) {
                $s['partners'][$i]['name'] = $t['partners'][$p['id']];
            }
        }

        foreach ($s['pillars'] as $i => $p) {
            $tp = $t['pillars'][$p['id']] ?? null;
            if ($tp) {
                $s['pillars'][$i] = array_merge($p, $tp);
            }
            if (! empty($s['pillars'][$i]['cover'])) {
                $s['pillars'][$i]['cover']['caption'] =
                    $tp['coverCaption'] ?? $ui('من الميدان');
            }
        }

        foreach ($s['reports']['items'] ?? [] as $i => $r) {
            $tr = $t['reports'][$r['id']] ?? null;

            // السرد الطويل غير مترجَم: يُسقَط كلياً من العرض الأجنبي
            foreach (['summary', 'appeal', 'reading', 'dataNotes',
                      'opportunities', 'closing', 'highlights', 'notice'] as $k) {
                $r[$k] = null;
            }

            if (! $tr) {
                $r['untranslated'] = true;
                $r['sections'] = [];
                $s['reports']['items'][$i] = $r;
                continue;
            }

            foreach (['label', 'range', 'reportTitle', 'metricsTitle'] as $k) {
                if (! empty($tr[$k])) {
                    $r[$k] = $tr[$k];
                }
            }
            if (! empty($tr['intro'])) {
                $r['intro'] = $tr['intro'];
            }
            if (! empty($tr['metrics'])) {
                foreach ($r['metrics'] as $m => $metric) {
                    $r['metrics'][$m] = array_merge($metric, $tr['metrics'][$m] ?? []);
                }
            }

            foreach (array_keys($r['sections'] ?? []) as $id) {
                $ts = $tr['sections'][$id] ?? null;
                if (! $ts) {
                    unset($r['sections'][$id]);
                    continue;
                }
                $sec = $r['sections'][$id];
                if (! empty($ts['lead'])) {
                    $sec['lead'] = $ts['lead'];
                }
                $sec['stats'] = $ts['stats'] ?? null;   // أرقام بوحدات مترجَمة
                $sec['groups'] = [];
                $sec['blocks'] = $sec['table'] = $sec['gallery'] = null;
                $sec['untranslated'] = true;            // التفصيل الكامل بالعربية
                $r['sections'][$id] = $sec;
            }

            $s['reports']['items'][$i] = $r;
        }

        return $s;
    }
}
