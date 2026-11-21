<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\BuildMeta;
use App\Services\SiteContent;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class PillarController extends Controller
{
    public function __invoke(string $slug, SiteContent $content, BuildMeta $meta): Response
    {
        $pillars = $content->get('pillars');
        $i = collect($pillars)->search(fn (array $p) => $p['id'] === $slug);

        if ($i === false) {
            throw new NotFoundHttpException();
        }

        $p = $pillars[$i];
        $reports = collect($content->get('reports.items'));

        // حصيلة المجال: أحدث تقرير يذكره، وقد لا يكون التقرير الحالي —
        // فالمجالات لا تظهر كلها في كل فترة.
        $latest = $reports->first(fn (array $r) => isset($r['sections'][$slug]));
        $alsoIn = $reports
            ->filter(fn (array $r) => isset($r['sections'][$slug]) && $r['id'] !== ($latest['id'] ?? null))
            ->map(fn (array $r) => ['id' => $r['id'], 'label' => $r['label']])
            ->values()->all();

        return Inertia::render('Pillar', [
            'pillar'  => $p,
            'index'   => $i,
            'total'   => count($pillars),
            'prev'    => $pillars[$i - 1] ?? null,
            'next'    => $pillars[$i + 1] ?? null,
            'section' => $latest['sections'][$slug] ?? null,
            'report'  => $latest === null ? null
                : ['id' => $latest['id'], 'label' => $latest['label']],
            'alsoIn'  => $alsoIn,
            // فهرس المجالات في بطاقة الغلاف: الرقم والاسم المختصر وحدهما
            'pillars' => collect($pillars)->map(fn (array $x) => collect($x)->only(['id', 'num', 'short']))->all(),
        ])->withViewData(['meta' => $meta($p['title'])]);
    }
}
