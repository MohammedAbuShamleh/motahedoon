<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\BuildMeta;
use App\Services\SiteContent;
use App\Services\VideoLibrary;
use Inertia\Inertia;
use Inertia\Response;

final class HomeController extends Controller
{
    public function __invoke(SiteContent $content, BuildMeta $meta, VideoLibrary $videos): Response
    {
        $current = collect($content->get('reports.items'))
            ->firstWhere('id', $content->get('reports.current'));

        return Inertia::render('Home', [
            'identity'    => $content->get('identity'),
            'founding'    => $content->get('founding'),
            'governance'  => $content->get('governance'),
            'partners'    => $content->get('partners'),
            'pillars'     => $content->get('pillars'),
            'intro'       => $content->get('intro'),
            'fieldPhotos' => $content->get('fieldPhotos'),
            // قسم الفيديو قبل «المؤسسات الشريكة»: المميّزة فالأحدث
            'videos'      => $videos->highlights(6),
            // صفّ «حسب الألبوم» تحت القسم: الغلاف والاسم والعدد، بلا المقاطع
            'videoAlbums' => array_map(fn (array $a) => collect($a)->only(['slug', 'title', 'cover', 'count'])->all(), $videos->albums()),
            'metricsCount' => $content->get('homeMetrics'),
            'currentReport' => $current,
            // «لمحة أثر» بكلّ الأرباع المنشورة: لكلّ ربع أرقامه وختم فترته
            'impactReports' => collect($content->get('reports.items'))
                ->filter(fn (array $r) => ! empty($r['metrics']))
                ->map(fn (array $r) => [
                    'id' => $r['id'], 'label' => $r['label'], 'metrics' => $r['metrics'],
                ])->values()->all(),
            'reports'     => collect($content->get('reports.items'))
                ->map(fn (array $r) => [
                    'id' => $r['id'], 'label' => $r['label'],
                    'range' => $r['range'], 'reportTitle' => $r['reportTitle'],
                ])->all(),
        ])->withViewData(['meta' => $meta()]);
    }
}
