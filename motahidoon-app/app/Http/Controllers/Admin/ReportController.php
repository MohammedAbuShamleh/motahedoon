<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportLineGroup;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportRequest;
use App\Http\Resources\Admin\ReportResource;
use App\Models\Pillar;
use App\Models\Report;
use App\Services\Admin\ReportService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class ReportController extends Controller
{
    public function index(): Response
    {
        $reports = Report::query()->latestFirst()->withCount('sections')
            ->get(['id', 'slug', 'label', 'range', 'status', 'is_current', 'published_at']);

        return Inertia::render('Admin/Reports/Index', ['reports' => $reports]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Reports/Form', $this->formProps(null));
    }

    public function store(ReportRequest $request, ReportService $service): RedirectResponse
    {
        $report = $service->save(null, $request->validated(), $request->user());

        return to_route('admin.reports.edit', $report)->with('success', 'أُنشئ التقرير. أضف أقسام المجالات أدناه.');
    }

    public function edit(Report $report): Response
    {
        $report->load(['reportFile', 'appealPhoto', 'lines', 'metrics', 'tables', 'sections.pillar', 'translations']);

        return Inertia::render('Admin/Reports/Form', $this->formProps($report));
    }

    public function update(ReportRequest $request, Report $report, ReportService $service): RedirectResponse
    {
        $service->save($report, $request->validated(), $request->user());

        return back()->with('success', 'حُفظ التقرير.');
    }

    public function destroy(Report $report, ReportService $service): RedirectResponse
    {
        $service->delete($report);

        return to_route('admin.reports.index')->with('success', 'حُذف التقرير.');
    }

    /** @return array<string, mixed> */
    private function formProps(?Report $report): array
    {
        return [
            'report' => $report === null ? null : ReportResource::make($report)->resolve(),
            'lineGroups' => collect(ReportLineGroup::cases())->map(fn ($g) => [
                'value' => $g->value, 'label' => $g->label(), 'hasTerm' => $g->hasTerm(),
            ]),
            'pillars' => Pillar::query()->ordered()->get(['id', 'short']),
        ];
    }
}
