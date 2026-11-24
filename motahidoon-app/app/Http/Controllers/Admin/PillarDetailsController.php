<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PillarDetailsRequest;
use App\Http\Requests\Admin\PillarSectionStoreRequest;
use App\Http\Resources\Admin\ReportSectionResource;
use App\Http\Resources\Admin\Translations;
use App\Models\Pillar;
use App\Services\Admin\PillarService;
use App\Services\Admin\ReportSectionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * صفحة المجال في اللوحة: التعريف الدائم، وحصيلته في كل فترة.
 * الأقسام نفسها أقسام التقارير — تُحفَظ عبر admin.sections.update كما في
 * محرّر التقرير، فلا مسارا كتابة لبيانات واحدة.
 */
final class PillarDetailsController extends Controller
{
    /** دليل المجالات والتقارير: كتابة التعريف وتحرير حصيلة كلّ ربع */
    public function guide(): Response
    {
        return Inertia::render('Admin/Pillars/Guide');
    }

    public function edit(Pillar $pillar, PillarService $service): Response
    {
        $pillar = $service->forDetails($pillar);

        return Inertia::render('Admin/Pillars/Details', [
            'pillar' => [
                ...$pillar->only(['id', 'num', 'short', 'title', 'slug', 'definition']),
                'translations' => Translations::of($pillar, PillarDetailsRequest::TRANSLATABLE),
            ],
            'sections' => ReportSectionResource::collection($pillar->reportSections)->resolve(),
            'reports' => $service->reportsWithout($pillar),
        ]);
    }

    public function update(PillarDetailsRequest $request, Pillar $pillar, PillarService $service): RedirectResponse
    {
        $service->saveDefinition($pillar, $request->validated(), $request->user());

        return back()->with('success', 'تم حفظ التعريف.');
    }

    public function addSection(PillarSectionStoreRequest $request, Pillar $pillar, ReportSectionService $sections): RedirectResponse
    {
        $sections->createFor((int) $request->validated('report_id'), $pillar);

        return back()->with('success', 'أُضيف المجال إلى التقرير.');
    }
}
