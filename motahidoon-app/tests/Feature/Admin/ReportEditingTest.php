<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Http\Resources\Admin\ReportResource;
use App\Http\Resources\Admin\ReportSectionResource;
use App\Models\Report;
use App\Models\ReportMetric;
use App\Models\ReportSection;
use App\Models\Translation;

final class ReportEditingTest extends AdminTestCase
{
    /** حمولة النموذج كما ترسلها اللوحة، مبنيّة من Resource التقرير نفسه. */
    private function payload(Report $report): array
    {
        $report->load(['reportFile', 'appealPhoto', 'lines', 'metrics', 'tables', 'sections.pillar', 'translations']);
        $data = ReportResource::make($report)->resolve();
        unset($data['id'], $data['report_file'], $data['appeal_photo'], $data['sections']);

        return $data;
    }

    public function test_resaving_a_report_unchanged_keeps_the_site_identical(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $report = Report::query()->where('slug', 'q3-2026')->firstOrFail();

        $this->put("/admin/reports/{$report->id}", $this->payload($report))->assertSessionHasNoErrors();

        $this->artisan('content:verify')->assertSuccessful();
    }

    public function test_metric_sync_keeps_translations_of_kept_rows_and_drops_removed(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $report = Report::query()->where('slug', 'q3-2026')->firstOrFail();
        $data = $this->payload($report);

        $kept = $data['metrics'][0]['id'];
        $removed = $data['metrics'][1]['id'];
        array_splice($data['metrics'], 1, 1);
        $data['metrics'][] = ['value' => '12,013,597', 'label' => 'مؤشّر جديد', 'accent' => false];

        $this->put("/admin/reports/{$report->id}", $data)->assertSessionHasNoErrors();

        $this->assertTrue(Translation::query()->where('translatable_type', 'report_metric')->where('translatable_id', $kept)->exists());
        $this->assertFalse(Translation::query()->where('translatable_type', 'report_metric')->where('translatable_id', $removed)->exists());
        // القيمة نصّ حرفي: الفاصلة باقية
        $this->assertDatabaseHas('report_metrics', ['report_id' => $report->id, 'value' => '12,013,597']);
        $this->assertSame(count($data['metrics']), ReportMetric::query()->where('report_id', $report->id)->count());
    }

    public function test_only_one_current_report(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $old = Report::query()->where('slug', 'q2-2026')->firstOrFail();
        $data = $this->payload($old);
        $data['is_current'] = true;

        $this->put("/admin/reports/{$old->id}", $data)->assertSessionHasNoErrors();

        $this->assertSame(['q2-2026'], Report::query()->where('is_current', true)->pluck('slug')->all());
        $this->assertSame('q2-2026', app(\App\Contracts\ContentSource::class)->base()['reports']['current']);
    }

    public function test_a_draft_cannot_be_current(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $report = Report::query()->where('slug', 'q2-2026')->firstOrFail();
        $data = $this->payload($report);
        $data['status'] = 'draft';
        $data['is_current'] = true;

        $this->put("/admin/reports/{$report->id}", $data)->assertSessionHasErrors('is_current');
    }

    public function test_section_resave_is_lossless_and_delete_cleans_translations(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $section = ReportSection::query()->whereHas('pillar', fn ($q) => $q->where('slug', 'relief'))
            ->whereHas('report', fn ($q) => $q->where('slug', 'q3-2026'))->firstOrFail();
        $section->load(['report', 'pillar', 'groups.items', 'blocks.figures', 'table', 'gallery.media', 'translations']);
        $data = ReportSectionResource::make($section)->resolve();

        $this->put("/admin/sections/{$section->id}", $data)->assertSessionHasNoErrors();
        $this->artisan('content:verify')->assertSuccessful();

        $this->delete("/admin/sections/{$section->id}")->assertRedirect();
        $this->assertFalse(Translation::query()->where('translatable_type', 'report_section')->where('translatable_id', $section->id)->exists());
    }

    public function test_deleting_a_report_leaves_no_orphan_translations(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $report = Report::query()->where('slug', 'q2-2026')->with(['sections', 'metrics', 'lines'])->firstOrFail();
        $ids = ['report_section' => $report->sections->modelKeys(), 'report_metric' => $report->metrics->modelKeys(), 'report_line' => $report->lines->modelKeys()];

        $this->delete("/admin/reports/{$report->id}")->assertRedirect('/admin/reports');

        foreach ($ids as $type => $keys) {
            $this->assertSame(0, Translation::query()->where('translatable_type', $type)->whereIn('translatable_id', $keys)->count(), $type);
        }
    }
}
