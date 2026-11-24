<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\BuildMeta;
use App\Services\SiteContent;
use App\Services\VideoLibrary;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/** مكتبة الفيديو: فهرس الألبومات، وصفحة كلّ ألبوم بمشغّله وقائمته. */
final class VideoController extends Controller
{
    public function index(VideoLibrary $library, BuildMeta $meta, SiteContent $content): Response
    {
        $albums = $library->albums();

        return Inertia::render('Videos', [
            // الألبومات تبويباتٍ (اسم وعدد ووصف)، والمقاطع كلّها شبكةً واحدة تُصفّى بها
            'albums' => array_map(fn (array $a) => collect($a)->except('videos')->all(), $albums),
            'videos' => $library->highlights(),
        ])->withViewData(['meta' => $meta($content->ui()['مكتبة الفيديو'] ?? 'مكتبة الفيديو')]);
    }

    public function album(string $slug, VideoLibrary $library, BuildMeta $meta): Response
    {
        $album = $library->album($slug) ?? throw new NotFoundHttpException();

        return Inertia::render('VideoAlbum', [
            'album' => $album,
            'others' => collect($library->albums())
                ->reject(fn (array $a) => $a['slug'] === $slug)
                ->map(fn (array $a) => collect($a)->only(['slug', 'title', 'cover', 'count'])->all())
                ->values()->all(),
        ])->withViewData(['meta' => $meta($album['title'])]);
    }
}
