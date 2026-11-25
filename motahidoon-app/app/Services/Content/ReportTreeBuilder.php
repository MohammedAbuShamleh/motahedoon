<?php

namespace App\Services\Content;

use App\Enums\ReportLineGroup;
use App\Models\Report;
use App\Models\ReportBlock;
use App\Models\ReportBlockFigure;
use App\Models\ReportGalleryItem;
use App\Models\ReportGroup;
use App\Models\ReportGroupItem;
use App\Models\ReportLine;
use App\Models\ReportMetric;
use App\Models\ReportSection;
use App\Models\ReportTable;

/**
 * يبني عقدة تقرير واحد بشكل reports.items[] في site.ar.json.
 *
 * التقرير الربعي متفاوت البنية: قسم فيه مجموعات، وآخر كتل أرقام، وثالث
 * جدول. لذلك كل مفتاح اختياري يُكتب فقط إن وُجد محتواه — كما في الأصل.
 */
final class ReportTreeBuilder
{
    /** ما يُحمَّل مسبقاً لكل تقرير — استعلام لكل علاقة، لا لكل سجل. */
    public const RELATIONS = [
        'reportFile', 'appealPhoto', 'lines', 'metrics', 'tables',
        'sections.pillar', 'sections.groups.items', 'sections.blocks.figures',
        'sections.table', 'sections.gallery.media',
    ];

    /** @return array<string, mixed> */
    public function build(Report $r): array
    {
        $lines = fn (ReportLineGroup $g) => $r->linesOf($g);
        $bodies = fn (ReportLineGroup $g): array => $lines($g)->pluck('body')->all();
        // بند بلا مصطلح يُكتب نصّاً وحده — كما في الأصل (dataNotes)
        $terms = fn (ReportLineGroup $g): array => $lines($g)
            ->map(fn (ReportLine $l) => $l->term === null
                ? ['text' => $l->body]
                : ['term' => $l->term, 'text' => $l->body])
            ->all();

        $node = [
            'id' => $r->slug,
            'label' => $r->label,
            'range' => $r->range,
            'reportTitle' => $r->report_title,
            'reportFile' => $r->reportFile?->path,
        ];
        $this->putList($node, 'notice', $bodies(ReportLineGroup::Notice));
        $this->putList($node, 'intro', $bodies(ReportLineGroup::Intro));
        $node['metricsTitle'] = $r->metrics_title;
        $node['metrics'] = $r->metrics->map(fn (ReportMetric $m) => $this->figure($m))->all();
        $this->putList($node, 'highlights', $bodies(ReportLineGroup::Highlight));

        $node['sections'] = $r->sections
            ->mapWithKeys(fn (ReportSection $s) => [$s->pillar->slug => $this->section($s)])
            ->all();

        if ($r->reading_title !== null) {
            $node['reading'] = ['title' => $r->reading_title, 'items' => $terms(ReportLineGroup::Reading)];
        }
        if ($r->data_notes_title !== null) {
            $node['dataNotes'] = ['title' => $r->data_notes_title, 'items' => $terms(ReportLineGroup::DataNote)];
        }
        if ($r->opportunities_title !== null) {
            $node['opportunities'] = [
                'title' => $r->opportunities_title,
                'items' => $bodies(ReportLineGroup::Opportunity),
            ];
        }
        if ($r->closing_title !== null) {
            $node['closing'] = [
                'title' => $r->closing_title,
                'paragraphs' => $bodies(ReportLineGroup::ClosingParagraph),
                'signoff' => $r->closing_signoff,
            ];
        }

        $summary = $r->summaryTable();
        if ($summary !== null) {
            // «summary» مرساة القسم في الصفحة، لا بيانات تُحرَّر
            $node['summary'] = ['id' => 'summary'] + $this->table($summary);
        }

        if ($r->appeal_title !== null) {
            $appeal = [
                'title' => $r->appeal_title,
                'lead' => $r->appeal_lead,
                'items' => $bodies(ReportLineGroup::AppealItem),
            ];
            if ($r->appealPhoto !== null) {
                $appeal['photo'] = ['src' => $r->appealPhoto->path, 'caption' => $r->appeal_photo_caption];
            }
            $node['appeal'] = $appeal;
        }

        return $node;
    }

    /** @return array<string, mixed> */
    private function section(ReportSection $s): array
    {
        $node = [];
        $this->putValue($node, 'lead', RichText::clean($s->lead));
        $this->putList($node, 'stats', $s->stats ?? []);
        $this->putList($node, 'groups', $s->groups->map(fn (ReportGroup $g) => $this->group($g))->all());
        $this->putList($node, 'blocks', $s->blocks->map(fn (ReportBlock $b) => $this->block($b))->all());
        if ($s->table !== null) {
            $node['table'] = $this->table($s->table);
        }
        $this->putList($node, 'gallery', $s->gallery->map(fn (ReportGalleryItem $g) => [
            'src' => $g->media->path,
            'caption' => $g->caption,
        ])->all());

        return $node;
    }

    /** @return array<string, mixed> */
    private function group(ReportGroup $g): array
    {
        $node = [];
        $this->putValue($node, 'num', $g->num);
        $this->putValue($node, 'title', $g->title);
        $node['items'] = $g->items->map(function (ReportGroupItem $i): array {
            $item = [];
            $this->putValue($item, 'term', $i->term);
            $item['text'] = RichText::clean($i->body);
            $this->putFlag($item, 'recap', $i->is_recap);

            return $item;
        })->all();
        $this->putFlag($node, 'recap', $g->is_recap);
        $this->putList($node, 'stats', $g->stats ?? []);

        return $node;
    }

    /** @return array<string, mixed> */
    private function block(ReportBlock $b): array
    {
        $node = [
            'title' => $b->title,
            'figures' => $b->figures->map(fn (ReportBlockFigure $f) => $this->figure($f))->all(),
        ];
        if ($b->note_body !== null) {
            $note = [];
            $this->putValue($note, 'term', $b->note_term);
            $note['text'] = RichText::clean($b->note_body);
            $node['note'] = $note;
        }

        return $node;
    }

    /** رقم (مؤشّر أو رقم كتلة): القيمة نصّ كما كُتبت. @return array<string, mixed> */
    private function figure(ReportMetric|ReportBlockFigure $f): array
    {
        $node = ['value' => $f->value];
        $this->putValue($node, 'prefix', $f->prefix);
        $node['label'] = $f->label;
        $this->putFlag($node, 'accent', $f->accent);
        $this->putValue($node, 'unit', $f->unit);

        return $node;
    }

    /** @return array<string, mixed> */
    private function table(ReportTable $t): array
    {
        $node = [];
        $this->putValue($node, 'title', $t->title);
        $node['head'] = $t->head;
        $node['rows'] = $t->rows;
        $this->putValue($node, 'foot', $t->foot);
        $this->putValue($node, 'footNote', $t->foot_note);

        return $node;
    }

    /** @param array<string, mixed> $node */
    private function putValue(array &$node, string $key, mixed $value): void
    {
        if ($value !== null) {
            $node[$key] = $value;
        }
    }

    /** @param array<string, mixed> $node  @param list<mixed> $list */
    private function putList(array &$node, string $key, array $list): void
    {
        if ($list !== []) {
            $node[$key] = $list;
        }
    }

    /** الأعلام لا تُكتب إلا صادقة — كما في الأصل. @param array<string, mixed> $node */
    private function putFlag(array &$node, string $key, bool $on): void
    {
        if ($on) {
            $node[$key] = true;
        }
    }
}
