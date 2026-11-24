<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\BuildMeta;
use App\Services\SiteContent;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class ReportController extends Controller
{
    /** slug فارغ = التقرير الحالي، كما كان ?id=report في الموقع الثابت. */
    public function __invoke(SiteContent $content, BuildMeta $meta, ?string $slug = null): Response
    {
        $items = collect($content->get('reports.items'));

        /* /reports بلا معرّف: الحالي، وإلا الأحدث. معرّف لا يطابق تقريراً
           منشوراً: 404 — لا يُعرض تقرير آخر مكانه بصمت. */
        $rep = $slug === null
            ? ($items->firstWhere('id', $content->get('reports.current')) ?? $items->first())
            : $items->firstWhere('id', $slug);

        if ($rep === null) {
            throw new NotFoundHttpException();
        }

        return Inertia::render('Report', [
            'report'  => $rep,
            // الغلاف يصحب المجال ليُرسم بجانب فصله؛ مجال بلا غلاف يأخذ لوحاً هندسياً
            'pillars' => collect($content->get('pillars'))
                ->map(fn (array $p) => [
                    'id' => $p['id'], 'num' => $p['num'],
                    'title' => $p['title'], 'short' => $p['short'], 'orgs' => $p['orgs'],
                    'cover' => $p['cover'] ?? null,
                ])->all(),
            'others'  => $items->filter(fn (array $r) => $r['id'] !== $rep['id'])
                ->map(fn (array $r) => [
                    'id' => $r['id'], 'label' => $r['label'], 'reportTitle' => $r['reportTitle'],
                ])->values()->all(),
        ])->withViewData(['meta' => $meta($rep['reportTitle'])]);
    }
}
