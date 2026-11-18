<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportSectionRequest;
use App\Http\Requests\Admin\ReportSectionStoreRequest;
use App\Http\Resources\Admin\ReportSectionResource;
use App\Models\Report;
use App\Models\ReportSection;
use App\Services\Admin\ReportSectionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class ReportSectionController extends Controller
{
    public function store(ReportSectionStoreRequest $request, Report $report, ReportSectionService $service): RedirectResponse
    {
        $section = $service->create($report, (int) $request->validated('pillar_id'));

        return to_route('admin.sections.edit', $section)->with('success', 'أُضيف القسم.');
    }

    public function edit(ReportSection $section): Response
    {
        $section->load(['report', 'pillar', 'groups.items', 'blocks.figures', 'table', 'gallery.media', 'translations']);

        return Inertia::render('Admin/Reports/Section', ['section' => ReportSectionResource::make($section)->resolve()]);
    }

    public function update(ReportSectionRequest $request, ReportSection $section, ReportSectionService $service): RedirectResponse
    {
        $service->update($section, $request->validated(), $request->user());

        return back()->with('success', 'حُفظ القسم.');
    }

    public function destroy(ReportSection $section, ReportSectionService $service): RedirectResponse
    {
        $report = $section->report_id;
        $service->delete($section);

        return to_route('admin.reports.edit', $report)->with('success', 'حُذف القسم.');
    }
}
