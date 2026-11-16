<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\BuildMeta;
use App\Services\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

final class AboutController extends Controller
{
    public function __invoke(SiteContent $content, BuildMeta $meta): Response
    {
        return Inertia::render('About', [
            'identity'     => $content->get('identity'),
            'founding'     => $content->get('founding'),
            'governance'   => $content->get('governance'),
            'intro'        => $content->get('intro'),
            'goals'        => $content->get('goals'),
            'aspirations'  => $content->get('aspirations'),
            'partnerCount' => count($content->get('partners')),
            'pillarCount'  => count($content->get('pillars')),
        ])->withViewData(['meta' => $meta($content->ui()['من نحن'] ?? 'من نحن')]);
    }
}
