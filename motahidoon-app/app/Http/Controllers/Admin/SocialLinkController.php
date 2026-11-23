<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SocialIconStyle;
use App\Enums\SocialPlatform;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SocialDisplayRequest;
use App\Http\Requests\Admin\SocialLinkRequest;
use App\Models\SocialLink;
use App\Services\Admin\SocialLinkService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class SocialLinkController extends Controller
{
    public function index(SocialLinkService $service): Response
    {
        return Inertia::render('Admin/SocialLinks/Index', [
            'links' => $service->listing()->map(fn (SocialLink $l) => [
                'id' => $l->id,
                'platform' => $l->platform->value,
                'url' => $l->url,
                'label' => $l->label,
                'position' => $l->position,
                'is_published' => $l->is_published,
            ])->all(),
            'platforms' => collect(SocialPlatform::cases())
                ->mapWithKeys(fn (SocialPlatform $p) => [$p->value => $p->label()])->all(),
            'display' => $service->display(),
            'styles' => collect(SocialIconStyle::cases())
                ->mapWithKeys(fn (SocialIconStyle $s) => [$s->value => $s->label()])->all(),
        ]);
    }

    /** إظهار القسم في التذييل أو إخفاؤه، ونمط الأيقونات */
    public function display(SocialDisplayRequest $request, SocialLinkService $service): RedirectResponse
    {
        $service->updateDisplay($request->validated());

        return back()->with('success', $request->boolean('social_enabled')
            ? 'تم حفظ إعداد العرض.'
            : 'أُخفيت روابط التواصل من التذييل.');
    }

    public function store(SocialLinkRequest $request, SocialLinkService $service): RedirectResponse
    {
        $service->save(null, $request->validated());

        return back()->with('success', 'تمت إضافة الرابط، وهو يظهر الآن في تذييل الموقع.');
    }

    public function update(SocialLinkRequest $request, SocialLink $link, SocialLinkService $service): RedirectResponse
    {
        $service->save($link, $request->validated());

        return back()->with('success', 'تم حفظ الرابط.');
    }

    public function destroy(SocialLink $link, SocialLinkService $service): RedirectResponse
    {
        $service->delete($link);

        return back()->with('success', 'تم حذف الرابط.');
    }
}
