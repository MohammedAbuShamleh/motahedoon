<?php

namespace App\Services\Content;

use App\Enums\ContentLineGroup;
use App\Enums\ReportLineGroup;
use App\Enums\TranslationStatus;
use App\Models\ContentLine;
use App\Models\Partner;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\SiteSetting;
use App\Models\UiString;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * ينقل طبقة ترجمة لغة واحدة (site.en.json / site.tr.json) إلى جدول
 * translations بحالة machine — الترجمات الحالية غير معتمدة.
 */
final class TranslationImporter
{
    private string $locale = 'en';

    /** @param array<string, mixed> $t */
    public function import(string $locale, array $t): void
    {
        $this->locale = $locale;
        $s = SiteSetting::current();

        $this->set($s, 'unapproved_notice', $t['unapproved'] ?? null);
        $this->set($s, 'name', $t['org']['name'] ?? null);
        $this->set($s, 'short_name', $t['org']['shortName'] ?? null);
        $this->set($s, 'tagline', $t['org']['tagline'] ?? null);
        $this->set($s, 'media_office', $t['mediaOffice'] ?? null);
        $this->set($s, 'vision', $t['identity']['vision'] ?? null);
        $this->set($s, 'mission', $t['identity']['mission'] ?? null);

        $pos = 0;
        foreach ($t['ui'] ?? [] as $key => $value) {
            $ui = UiString::query()->firstOrCreate(['key' => $key], ['position' => ++$pos]);
            $this->set($ui, 'value', $value);
        }

        $lines = ContentLine::query()->ordered()->get()->groupBy(fn (ContentLine $l) => $l->group->value);
        foreach ($t['identity']['values'] ?? [] as $i => $v) {
            $line = $lines->get(ContentLineGroup::Value->value)?->get($i);
            $this->set($line, 'term', $v['term'] ?? null);
            $this->set($line, 'body', $v['text'] ?? null);
        }
        $this->bodies($lines->get(ContentLineGroup::Story->value), $t['founding']['story'] ?? []);
        $this->bodies($lines->get(ContentLineGroup::Goal->value), $t['goals'] ?? []);
        $this->bodies($lines->get(ContentLineGroup::Aspiration->value), $t['aspirations'] ?? []);
        $this->bodies($lines->get(ContentLineGroup::Intro->value), $t['intro'] ?? []);

        $partners = Partner::query()->get()->keyBy('slug');
        foreach ($t['partners'] ?? [] as $slug => $name) {
            $this->set($partners->get($slug), 'name', $name);
        }

        $pillars = Pillar::query()->get()->keyBy('slug');
        $pillarFields = ['title' => 'title', 'short' => 'short', 'coverCaption' => 'cover_caption',
            'orgs' => 'orgs', 'definition' => 'definition'];
        foreach ($t['pillars'] ?? [] as $slug => $tp) {
            foreach ($pillarFields as $key => $field) {
                $this->set($pillars->get($slug), $field, $tp[$key] ?? null);
            }
        }

        $reports = Report::query()->with(['metrics', 'sections.pillar', 'lines'])->get()->keyBy('slug');
        foreach ($t['reports'] ?? [] as $slug => $tr) {
            $this->report($reports->get($slug), $tr);
        }
    }

    /** @param array<string, mixed> $tr */
    private function report(?Report $r, array $tr): void
    {
        if ($r === null) {
            return;
        }
        foreach (['label' => 'label', 'range' => 'range', 'reportTitle' => 'report_title',
            'metricsTitle' => 'metrics_title'] as $key => $field) {
            $this->set($r, $field, $tr[$key] ?? null);
        }
        $this->bodies($r->linesOf(ReportLineGroup::Intro), $tr['intro'] ?? []);

        foreach ($tr['metrics'] ?? [] as $i => $m) {
            $metric = $r->metrics->get($i);
            $this->set($metric, 'label', $m['label'] ?? null);
            $this->set($metric, 'unit', $m['unit'] ?? null);
        }

        $sections = $r->sections->keyBy(fn ($s) => $s->pillar->slug);
        foreach ($tr['sections'] ?? [] as $slug => $ts) {
            $section = $sections->get($slug);
            $this->set($section, 'lead', $ts['lead'] ?? null);
            // الأرقام المترجمة الوحدات لا مقابل عربياً لها؛ تُحفظ كتلةً JSON
            $this->set($section, 'stats', isset($ts['stats'])
                ? json_encode($ts['stats'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)
                : null);
        }
    }

    /** @param list<string> $values */
    private function bodies(?Collection $models, array $values): void
    {
        foreach ($values as $i => $value) {
            $this->set($models?->get($i), 'body', $value);
        }
    }

    private function set(?Model $model, string $field, ?string $value): void
    {
        if ($model === null || $value === null) {
            return;
        }
        $model->translations()->updateOrCreate(
            ['field' => $field, 'locale' => $this->locale],
            ['value' => $value, 'status' => TranslationStatus::Machine],
        );
    }
}
