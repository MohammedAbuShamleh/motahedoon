<?php

namespace App\Http\Resources\Admin;

use App\Models\ReportBlock;
use App\Models\ReportBlockFigure;
use App\Models\ReportGalleryItem;
use App\Models\ReportGroup;
use App\Models\ReportGroupItem;
use App\Models\ReportSection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ReportSection */
final class ReportSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'report' => ['id' => $this->report->id, 'label' => $this->report->label],
            'pillar' => $this->pillar->title,
            'lead' => $this->lead,
            'groups' => $this->groups->map(fn (ReportGroup $g) => [
                ...$g->only(['id', 'num', 'title', 'is_recap']),
                'items' => $g->items->map(fn (ReportGroupItem $i) => $i->only(['id', 'term', 'body', 'is_recap']))->all(),
            ])->all(),
            'blocks' => $this->blocks->map(fn (ReportBlock $b) => [
                ...$b->only(['id', 'title', 'note_term', 'note_body']),
                'figures' => $b->figures->map(fn (ReportBlockFigure $f) => $f->only(['id', 'value', 'prefix', 'unit', 'label', 'accent']))->all(),
            ])->all(),
            'table' => $this->table === null ? null : [
                'title' => $this->table->title, 'head' => $this->table->head, 'rows' => $this->table->rows,
                'foot' => $this->table->foot, 'foot_note' => $this->table->foot_note,
            ],
            'gallery' => $this->gallery->map(fn (ReportGalleryItem $g) => [
                'id' => $g->id, 'media_id' => $g->media_id, 'url' => $g->media->url(), 'caption' => $g->caption,
            ])->all(),
            'translations' => Translations::of($this->resource, ['lead']),
        ];
    }
}
