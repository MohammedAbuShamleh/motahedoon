<?php

namespace App\Http\Resources\Admin;

use App\Enums\ReportLineGroup;
use App\Http\Requests\Admin\ReportRequest;
use App\Models\Report;
use App\Models\ReportLine;
use App\Models\ReportMetric;
use App\Models\ReportSection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Report */
final class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $summary = $this->summaryTable();

        return [
            ...$this->resource->only([
                'id', 'slug', 'label', 'range', 'report_title', 'metrics_title', 'reading_title',
                'data_notes_title', 'opportunities_title', 'closing_title', 'closing_signoff',
                'appeal_title', 'appeal_lead', 'appeal_photo_caption', 'is_current',
            ]),
            'status' => $this->status->value,
            'report_file' => MediaResource::brief($this->reportFile),
            'appeal_photo' => MediaResource::brief($this->appealPhoto),
            'lines' => collect(ReportLineGroup::cases())->mapWithKeys(fn (ReportLineGroup $g) => [
                $g->value => $this->linesOf($g)->map(fn (ReportLine $l) => [
                    'id' => $l->id, 'term' => $l->term, 'body' => $l->body,
                ])->all(),
            ])->all(),
            'metrics' => $this->metrics->map(fn (ReportMetric $m) => $m->only(['id', 'value', 'prefix', 'unit', 'label', 'accent']))->all(),
            'summary' => $summary === null ? null : [
                'title' => $summary->title, 'head' => $summary->head, 'rows' => $summary->rows,
                'foot' => $summary->foot, 'foot_note' => $summary->foot_note,
            ],
            'sections' => $this->sections->map(fn (ReportSection $s) => [
                'id' => $s->id,
                'pillar' => $s->pillar->short,
            ])->all(),
            'translations' => Translations::of($this->resource, ReportRequest::TRANSLATABLE),
        ];
    }
}
