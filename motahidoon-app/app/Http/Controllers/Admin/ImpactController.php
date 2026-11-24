<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportLineGroup;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImpactRequest;
use App\Http\Resources\Admin\Translations;
use App\Models\Report;
use App\Models\ReportLine;
use App\Models\ReportMetric;
use App\Models\SiteSetting;
use App\Services\Admin\ReportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * «الإنجازات والأثر» في صفحة واحدة: ما يراه الزائر من أرقام التقرير
 * وإنجازاته وقراءته، بلا باقي حقول التقرير. يُفتح على التقرير الحالي،
 * ويمكن التبديل إلى أيّ تقرير آخر.
 */
final class ImpactController extends Controller
{
    public function index(Request $request, ReportService $service): Response
    {
        $reports = $service->listing();
        $selected = $reports->firstWhere('id', (int) $request->query('report'))
            ?? $reports->firstWhere('is_current', true)
            ?? $reports->first();

        $report = $selected === null ? null : Report::query()
            ->with(['translations', 'lines.translations', 'metrics.translations'])->find($selected->id);
        // حقول الترجمة بحسب المجموعة: أبرز الإنجازات بلا عنوان بند
        $lines = fn (ReportLineGroup $g) => $report->linesOf($g)
            ->map(fn (ReportLine $l) => [
                'id' => $l->id, 'term' => $l->term, 'body' => $l->body,
                'translations' => Translations::of($l, $g->hasTerm() ? ['term', 'body'] : ['body']),
            ])->all();

        return Inertia::render('Admin/Impact/Index', [
            'reports' => $reports->map(fn (Report $r) => [
                'id' => $r->id, 'label' => $r->label, 'is_current' => $r->is_current, 'status' => $r->status->value,
            ])->all(),
            'report' => $report === null ? null : [
                'id' => $report->id,
                'label' => $report->label,
                'range' => $report->range,
                'slug' => $report->slug,
                'status' => $report->status->value,
                'is_current' => $report->is_current,
                'metrics_title' => $report->metrics_title,
                'reading_title' => $report->reading_title,
                'translations' => Translations::of($report, ImpactRequest::TRANSLATABLE),
                'metrics' => $report->metrics
                    ->map(fn (ReportMetric $m) => [
                        ...$m->only(['id', 'value', 'prefix', 'unit', 'label', 'accent']),
                        'translations' => Translations::of($m, ['label', 'unit']),
                    ])->all(),
                'highlight' => $lines(ReportLineGroup::Highlight),
                'reading' => $lines(ReportLineGroup::Reading),
            ],
            'homeCount' => (int) (SiteSetting::current()->home_metrics_count ?? 0),
        ]);
    }

    public function update(ImpactRequest $request, Report $report, ReportService $service): RedirectResponse
    {
        $service->saveImpact($report, $request->validated(), $request->user());

        return back()->with('success', 'تم حفظ الإنجازات والأثر.');
    }
}
