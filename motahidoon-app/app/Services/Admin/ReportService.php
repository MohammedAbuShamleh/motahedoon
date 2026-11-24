<?php

namespace App\Services\Admin;

use App\Enums\ReportLineGroup;
use App\Enums\ReportStatus;
use App\Http\Requests\Admin\ImpactRequest;
use App\Http\Requests\Admin\ReportRequest;
use App\Models\Report;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Media\MediaService;
use App\Traits\SyncsChildren;
use Closure;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** التقرير ومكوّناته العامّة. الأقسام في ReportSectionService. */
final class ReportService
{
    use SyncsChildren;

    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
    ) {}

    /** @return Collection<int, Report> التقارير الأحدث أوّلاً، بعدد أقسام كلٍّ منها */
    public function listing(): Collection
    {
        return Report::query()->latestFirst()->withCount('sections')
            ->get(['id', 'slug', 'label', 'range', 'status', 'is_current', 'published_at']);
    }

    /** التقرير جاهزاً لنموذج التحرير: ملفاته وأسطره وأرقامه وجداوله وأقسامه وترجماته محمَّلة */
    public function forEdit(Report $report): Report
    {
        return $report->load(['reportFile', 'appealPhoto', 'lines', 'metrics', 'tables', 'sections.pillar', 'translations']);
    }

    /** @param array<string, mixed> $data */
    public function save(?Report $report, array $data, User $by): Report
    {
        return DB::transaction(function () use ($report, $data, $by): Report {
            $report ??= new Report;
            $status = ReportStatus::from($data['status']);

            $report->fill([
                ...collect($data)->only([
                    'slug', 'label', 'range', 'report_title', 'metrics_title', 'reading_title',
                    'data_notes_title', 'opportunities_title', 'closing_title', 'closing_signoff',
                    'appeal_title', 'appeal_lead', 'appeal_photo_caption',
                ])->all(),
                'status' => $status,
                // تاريخ النشر يُثبَّت أوّل مرّة وحدها: إعادة الحفظ لا تغيّر ترتيب الأرشيف
                'published_at' => $status === ReportStatus::Published ? ($report->published_at ?? now()) : null,
                'report_file_media_id' => $this->media->replace(
                    $data['report_file'] ?? null, $report->report_file_media_id,
                    (bool) ($data['remove_report_file'] ?? false), false, $by->id
                ),
                'appeal_photo_media_id' => $this->media->replace(
                    $data['appeal_photo'] ?? null, $report->appeal_photo_media_id,
                    (bool) ($data['remove_appeal_photo'] ?? false), true, $by->id
                ),
            ])->save();

            $this->syncLines($report, $data['lines'] ?? []);
            $this->syncChildren($report->metrics(), $data['metrics'] ?? [], fn (array $m) => [
                'value' => $m['value'],
                'prefix' => $m['prefix'] ?? null,
                'unit' => $m['unit'] ?? null,
                'label' => $m['label'],
                'accent' => (bool) ($m['accent'] ?? false),
            ]);
            $this->syncSummary($report, $data['summary'] ?? null);
            $this->translations->syncFields($report, $data['translations'] ?? null, ReportRequest::TRANSLATABLE, $by);

            if ($data['is_current']) {
                $this->makeCurrent($report);
            } elseif ($report->is_current) {
                $report->update(['is_current' => false]);
            }

            return $report;
        });
    }

    /**
     * التقرير الحالي واحد. يُفرض هنا داخل معاملة لا في المخطط
     * (قيد «صفّ واحد بقيمة true» لا يُعبَّر عنه في MySQL إلا بحيلة).
     */
    public function makeCurrent(Report $report): void
    {
        if ($report->status !== ReportStatus::Published) {
            throw ValidationException::withMessages(['is_current' => 'التقرير الحالي يجب أن يكون منشوراً.']);
        }
        DB::transaction(function () use ($report): void {
            Report::query()->whereKeyNot($report->id)->where('is_current', true)->get()
                ->each(fn (Report $r) => $r->update(['is_current' => false]));
            $report->update(['is_current' => true]);
        });
    }

    public function delete(Report $report): void
    {
        DB::transaction(function () use ($report): void {
            // الأبناء تُحذف بقيد cascade لا بأحداث النماذج، فترجماتها تُحذف هنا صراحة
            $report->load(['sections', 'metrics', 'lines']);
            $this->translations->purge($report->sections);
            $this->translations->purge($report->metrics);
            $this->translations->purge($report->lines);
            $report->delete();
        });
    }

    /**
     * «الإنجازات والأثر» وحدها: المؤشّرات وعنوانها، وأبرز الإنجازات، وقراءة
     * الأثر وعنوانها، وعدد أرقام الرئيسية — بعربيّتها وترجماتها معاً.
     * لا يمسّ باقي التقرير ولا ترجماته.
     *
     * @param array<string, mixed> $data
     */
    public function saveImpact(Report $report, array $data, User $by): void
    {
        DB::transaction(function () use ($report, $data, $by): void {
            $report->update([
                'metrics_title' => $data['metrics_title'],
                'reading_title' => $data['reading_title'] ?? null,
            ]);
            $this->translations->syncFields($report, $data['translations'] ?? null, ImpactRequest::TRANSLATABLE, $by);

            // ترجمة كلّ بند تُزامَن بعد حفظه، فالبند الجديد يأخذ ترجمته في الحفظ نفسه
            $translate = fn (array $fields) => fn (Model $child, array $row) =>
                $this->translations->syncFields($child, $row['translations'] ?? null, $fields, $by);

            $this->syncChildren($report->metrics(), $data['metrics'] ?? [], fn (array $m) => [
                'value' => $m['value'],
                'prefix' => $m['prefix'] ?? null,
                'unit' => $m['unit'] ?? null,
                'label' => $m['label'],
                'accent' => (bool) ($m['accent'] ?? false),
            ], $translate(['label', 'unit']));
            $this->syncLines($report, [
                ReportLineGroup::Highlight->value => $data['highlight'] ?? [],
                ReportLineGroup::Reading->value => $data['reading'] ?? [],
            ], [ReportLineGroup::Highlight, ReportLineGroup::Reading], $translate(['term', 'body']));
            SiteSetting::current()->update(['home_metrics_count' => (int) $data['home_metrics_count']]);
        });
    }

    /**
     * @param array<string, list<array<string, mixed>>> $lines
     * @param list<ReportLineGroup>|null $only  المجموعات المُزامَنة؛ null = كلّها
     * @param (Closure(Model, array<string, mixed>): void)|null $after  لمزامنة ترجمة كلّ سطر
     */
    private function syncLines(Report $report, array $lines, ?array $only = null, ?Closure $after = null): void
    {
        foreach ($only ?? ReportLineGroup::cases() as $group) {
            $this->syncChildren(
                $report->lines()->where('group', $group->value),
                $lines[$group->value] ?? [],
                fn (array $l) => [
                    'group' => $group,
                    'term' => $group->hasTerm() ? ($l['term'] ?? null) : null,
                    'body' => $l['body'],
                ],
                $after,
            );
        }
    }

    /** @param array<string, mixed>|null $summary */
    private function syncSummary(Report $report, ?array $summary): void
    {
        $existing = $report->tables()->whereNull('report_section_id')->first();

        if ($summary === null || ($summary['head'] ?? []) === []) {
            $existing?->delete();

            return;
        }
        $attrs = TableData::from($summary);
        $existing ? $existing->update($attrs) : $report->tables()->create($attrs + ['position' => 1]);
    }
}
