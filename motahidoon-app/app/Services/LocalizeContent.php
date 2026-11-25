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
            $ar = $r;

            // السرد الطويل غير مترجَم: يُسقَط كلياً من العرض الأجنبي.
            // أبرز الإنجازات وقراءة الأثر يعودان أدناه إن تُرجما كاملين
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
            $r['highlights'] = $this->lines($ar['highlights'] ?? null, $tr['highlights'] ?? null);
            if (! empty($ar['reading']) && ! empty($tr['readingTitle'])) {
                $items = $this->lines($ar['reading']['items'], $tr['reading'] ?? null);
                $r['reading'] = $items === null ? null : ['title' => $tr['readingTitle'], 'items' => $items];
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

                // التفصيل الكامل: يُعرض مترجَماً إن طابق بنية العربية تماماً؛
                // وإلا يُسقَط كلّه ويبقى رابط العربية — لا تفصيل نصفه عربي
                $detail = $this->detail($sec, $ts['detail'] ?? null);
                if ($detail !== null) {
                    $sec = array_merge($sec, $detail);
                    unset($sec['untranslated']);
                } else {
                    $sec['groups'] = [];
                    $sec['blocks'] = $sec['table'] = $sec['gallery'] = null;
                    $sec['untranslated'] = true;        // التفصيل الكامل بالعربية
                }
                $r['sections'][$id] = $sec;
            }

            $s['reports']['items'][$i] = $r;
        }

        return $s;
    }

    /**
     * قائمة أسطر مترجَمة كاملةً بترتيب العربية، أو null إن نقص منها شيء.
     *
     * السطر العربي نصّ مجرّد (أبرز الإنجازات) أو {term, text} (قراءة الأثر).
     * المطابقة تامّة كالتفصيل: العدد نفسه، وكلّ نصّ عربي له مقابل مترجَم —
     * فلا قائمة نصفها عربي، ولا عنوان بند يسقط بصمت.
     *
     * @param  list<string|array<string, string|null>>|null  $ar
     * @param  list<array<string, string|null>>|null         $tr
     * @return list<string|array<string, string>>|null
     */
    private function lines(?array $ar, ?array $tr): ?array
    {
        if (empty($ar) || ! is_array($tr) || count($tr) !== count($ar)) {
            return null;
        }
        $filled = fn (mixed $v): bool => is_string($v) && trim($v) !== '';
        $out = [];
        foreach (array_values($ar) as $i => $line) {
            $tl = $tr[$i] ?? null;
            if (! is_array($tl) || ! $filled($tl['text'] ?? null)) {
                return null;
            }
            if (is_string($line)) {
                $out[] = $tl['text'];
                continue;
            }
            if (! empty($line['term']) && ! $filled($tl['term'] ?? null)) {
                return null;
            }
            $out[] = ['term' => empty($line['term']) ? null : $tl['term'], 'text' => $tl['text']];
        }

        return $out;
    }

    /**
     * يدمج التفصيل المترجَم فوق العربية بالترتيب، أو null إن لم يطابقها.
     *
     * المطابقة تامّة: العدد نفسه في كلّ قائمة، وكلّ حقل نصّي موجود في
     * العربية موجود مترجَماً. الأرقام (value) والترقيم والأعلام والصور
     * تُؤخذ من العربية دائماً — الترجمة لا تحمل رقماً يُعرض.
     *
     * @param  array<string, mixed>       $sec  القسم العربي
     * @param  array<string, mixed>|null  $td   التفصيل المترجَم
     * @return array<string, mixed>|null
     */
    private function detail(array $sec, ?array $td): ?array
    {
        if ($td === null) {
            return null;
        }
        $has = fn (string $k): bool => ! empty($sec[$k]);
        if (! $has('groups') && ! $has('blocks') && ! $has('table') && ! $has('gallery')) {
            return null;                                   // لا تفصيل أصلاً
        }
        // نصّ مترجَم مطلوب حيث وُجد نصّ عربي، وغائب حيث غاب
        $text = function (array $ar, array $tr, string $k, array &$out): bool {
            if (! isset($ar[$k])) {
                return true;
            }
            if (! is_string($tr[$k] ?? null) || trim($tr[$k]) === '') {
                return false;
            }
            $out[$k] = $tr[$k];

            return true;
        };
        $same = fn (mixed $a, mixed $b): bool => is_array($a) && is_array($b) && count($a) === count($b);
        $out = [];

        if ($has('groups')) {
            if (! $same($sec['groups'], $td['groups'] ?? null)) {
                return null;
            }
            foreach ($sec['groups'] as $gi => $g) {
                $tg = $td['groups'][$gi];
                if (! is_array($tg) || ! $text($g, $tg, 'title', $g) || ! $same($g['items'], $tg['items'] ?? null)) {
                    return null;
                }
                foreach ($g['items'] as $ii => $it) {
                    $ti = $tg['items'][$ii];
                    if (! is_array($ti) || ! $text($it, $ti, 'term', $it) || ! $text($it, $ti, 'text', $it)) {
                        return null;
                    }
                    $g['items'][$ii] = $it;
                }
                unset($g['stats']);
                $out['groups'][$gi] = $g;
            }
        }

        if ($has('blocks')) {
            if (! $same($sec['blocks'], $td['blocks'] ?? null)) {
                return null;
            }
            foreach ($sec['blocks'] as $bi => $b) {
                $tb = $td['blocks'][$bi];
                if (! is_array($tb) || ! $text($b, $tb, 'title', $b) || ! $same($b['figures'], $tb['figures'] ?? null)) {
                    return null;
                }
                foreach ($b['figures'] as $fi => $f) {
                    $tf = $tb['figures'][$fi];
                    foreach (['label', 'unit', 'prefix'] as $k) {
                        if (! is_array($tf) || ! $text($f, $tf, $k, $f)) {
                            return null;
                        }
                    }
                    $b['figures'][$fi] = $f;
                }
                if (isset($b['note'])) {
                    $tn = $tb['note'] ?? null;
                    if (! is_array($tn) || ! $text($b['note'], $tn, 'term', $b['note']) || ! $text($b['note'], $tn, 'text', $b['note'])) {
                        return null;
                    }
                }
                $out['blocks'][$bi] = $b;
            }
        }

        if ($has('table')) {
            $t = $sec['table'];
            $tt = $td['table'] ?? null;
            if (! is_array($tt) || ! $text($t, $tt, 'title', $t) || ! $text($t, $tt, 'footNote', $t)) {
                return null;
            }
            // خانة بخانة: المترجَمة نصّ، وغير فارغة حيث العربية غير فارغة
            $cells = function (mixed $a, mixed $b) use ($same): bool {
                if (! $same($a, $b)) {
                    return false;
                }
                foreach (array_values($a) as $i => $c) {
                    $tc = array_values($b)[$i];
                    if (! is_string($tc) || (trim((string) $c) !== '' && trim($tc) === '')) {
                        return false;
                    }
                }

                return true;
            };
            if (! $cells($t['head'], $tt['head'] ?? null) || ! $same($t['rows'], $tt['rows'] ?? null)) {
                return null;
            }
            foreach ($t['rows'] as $ri => $row) {
                if (! $cells($row, $tt['rows'][$ri])) {
                    return null;
                }
            }
            if (isset($t['foot']) && ! $cells($t['foot'], $tt['foot'] ?? null)) {
                return null;
            }
            $t['head'] = $tt['head'];
            $t['rows'] = $tt['rows'];
            if (isset($t['foot'])) {
                $t['foot'] = $tt['foot'];
            }
            $out['table'] = $t;
        }

        if ($has('gallery')) {
            if (! $same($sec['gallery'], $td['gallery'] ?? null)) {
                return null;
            }
            foreach ($sec['gallery'] as $i => $g) {
                $tg = $td['gallery'][$i];
                if (! is_array($tg) || ! $text($g, $tg, 'caption', $g)) {
                    return null;
                }
                $out['gallery'][$i] = $g;
            }
        }

        return $out;
    }
}
