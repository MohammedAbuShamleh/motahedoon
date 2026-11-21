<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportLineGroup;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportRequest;
use App\Http\Resources\Admin\ReportResource;
use App\Models\Report;
use App\Services\Admin\PillarService;
use App\Services\Admin\ReportService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class ReportController extends Controller
{
    public function index(ReportService $service): Response
    {
        return Inertia::render('Admin/Reports/Index', ['reports' => $service->listing()]);
    }

    public function create(PillarService $pillars): Response
    {
        return Inertia::render('Admin/Reports/Form', $this->formProps(null, $pillars));
    }

    public function store(ReportRequest $request, ReportService $service): RedirectResponse
    {
        $report = $service->save(null, $request->validated(), $request->user());

        return to_route('admin.reports.edit', $report)->with('success', 'تم إنشاء التقرير. أضف أقسام المجالات في الأسفل.');
    }

    public function edit(Report $report, ReportService $service, PillarService $pillars): Response
    {
        return Inertia::render('Admin/Reports/Form', $this->formProps($service->forEdit($report), $pillars));
    }

    public function update(ReportRequest $request, Report $report, ReportService $service): RedirectResponse
    {
        $service->save($report, $request->validated(), $request->user());

        return back()->with('success', 'تم حفظ التقرير.');
    }

    public function destroy(Report $report, ReportService $service): RedirectResponse
    {
        $service->delete($report);

        return to_route('admin.reports.index')->with('success', 'تم حذف التقرير.');
    }

    /** @return array<string, mixed> */
    private function formProps(?Report $report, PillarService $pillars): array
    {
        return [
            'report' => $report === null ? null : ReportResource::make($report)->resolve(),
            'lineGroups' => collect(ReportLineGroup::cases())->map(fn ($g) => [
                'value' => $g->value, 'label' => $g->label(), 'hasTerm' => $g->hasTerm(),
            ]),
            'pillars' => $pillars->options(),
        ];
    }
}
