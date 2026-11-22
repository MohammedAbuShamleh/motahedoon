<?php

namespace App\Services\Content;

use App\Enums\ContentLineGroup;
use App\Enums\TranslationStatus;
use App\Models\ContentLine;
use App\Models\Partner;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\ReportMetric;
use App\Models\ReportSection;
use App\Models\SiteSetting;
use App\Models\Translation;
use App\Models\UiString;
use Illuminate\Support\Collection;

/**
 * يبني طبقة الترجمة للّغة بشكل site.{en,tr}.json.
 *
 * لا يُكتب إلا ما تُرجم فعلاً؛ وLocalizeContent يتكفّل بإسقاط ما لم
 * يُترجَم من العرض الأجنبي. تنويه «ترجمة غير معتمدة» يختفي تلقائياً
 * حين تصير كل ترجمات اللغة معتمدة — لا بتبديل يدوي.
 */
final class OverlayBuilder
{
    private string $locale = 'en';

    /** @return array<string, mixed> */
    public function build(string $locale): array
    {
        $this->locale = $locale;
        $with = ['translations' => fn ($q) => $q->where('locale', $locale)];

        $s = SiteSetting::query()->with($with)->firstOrFail();
        $lines = ContentLine::query()->ordered()->with($with)->get()
            ->groupBy(fn (ContentLine $l) => $l->group->value);
        $t = fn (string $field) => $s->translated($field, $locale);

        $out = [];
        $hasPending = Translation::query()->where('locale', $locale)
            ->where('status', '!=', TranslationStatus::Approved)->exists();
        if ($hasPending && ($notice = $t('unapproved_notice')) !== null) {
            $out['unapproved'] = $notice;
        }

        $out['ui'] = UiString::query()->ordered()->with($with)->get()
            ->mapWithKeys(fn (UiString $u) => [$u->key => $u->translated('value', $locale)])
            ->filter(fn (?string $v) => $v !== null)->all();

        $this->put($out, 'org', $this->fields([
            'name' => $t('name'), 'shortName' => $t('short_name'), 'tagline' => $t('tagline'),
        ]));
        $this->put($out, 'mediaOffice', $t('media_office'));
        $this->put($out, 'intro', $this->bodies($lines->get(ContentLineGroup::Intro->value)));
        $story = $this->bodies($lines->get(ContentLineGroup::Story->value));
        $this->put($out, 'founding', $story === [] ? [] : ['story' => $story]);
        $this->put($out, 'identity', $this->fields([
            'vision' => $t('vision'),
            'mission' => $t('mission'),
            'values' => $this->terms($lines->get(ContentLineGroup::Value->value)),
        ]));
        $this->put($out, 'goals', $this->bodies($lines->get(ContentLineGroup::Goal->value)));
        $this->put($out, 'aspirations', $this->bodies($lines->get(ContentLineGroup::Aspiration->value)));

        $this->put($out, 'partners', Partner::query()->ordered()->with($with)->get()
            ->mapWithKeys(fn (Partner $p) => [$p->slug => $p->translated('name', $locale)])
            ->filter()->all());

        $this->put($out, 'pillars', Pillar::query()->ordered()->with($with)->get()
            ->mapWithKeys(fn (Pillar $p) => [$p->slug => $this->fields([
                'title' => $p->translated('title', $locale),
                'short' => $p->translated('short', $locale),
                'coverCaption' => $p->translated('cover_caption', $locale),
                'orgs' => $p->translated('orgs', $locale),
                'definition' => $p->translated('definition', $locale),
            ])])->filter()->all());

        $this->put($out, 'reports', $this->reports($with));

        return $out;
    }

    /** @param array<string, mixed> $with  @return array<string, mixed> */
    private function reports(array $with): array
    {
        $reports = Report::query()->published()->latestFirst()->with([
            ...$with,
            'lines' => fn ($q) => $q->where('group', 'intro')->with($with),
            'metrics.translations' => $with['translations'],
            'sections.pillar',
            'sections.translations' => $with['translations'],
        ])->get();

        return $reports->mapWithKeys(function (Report $r): array {
            $node = $this->fields([
                'label' => $r->translated('label', $this->locale),
                'range' => $r->translated('range', $this->locale),
                'reportTitle' => $r->translated('report_title', $this->locale),
                'metricsTitle' => $r->translated('metrics_title', $this->locale),
                'intro' => $this->bodies($r->lines),
            ]);

            $metrics = $r->metrics->map(fn (ReportMetric $m) => $this->fields([
                'label' => $m->translated('label', $this->locale),
                'unit' => $m->translated('unit', $this->locale),
            ]));
            if ($metrics->contains(fn (array $m) => $m !== [])) {
                $node['metrics'] = $metrics->all();
            }

            $sections = $r->sections->mapWithKeys(function (ReportSection $s): array {
                $stats = $s->translated('stats', $this->locale);
                $detail = $s->translated('detail', $this->locale);

                return [$s->pillar->slug => $this->fields([
                    'lead' => $s->translated('lead', $this->locale),
                    'stats' => $stats === null ? null : json_decode($stats, true, 8, JSON_THROW_ON_ERROR),
                    // التفصيل الكامل كتلةً واحدة؛ مطابقته للعربية يفحصها LocalizeContent
                    'detail' => $detail === null ? null : json_decode($detail, true, 16, JSON_THROW_ON_ERROR),
                ])];
            })->filter()->all();
            $this->put($node, 'sections', $sections);

            return $node === [] ? [] : [$r->slug => $node];
        })->all();
    }

    /** @return list<string> */
    private function bodies(?Collection $models): array
    {
        return ($models ?? collect())
            ->map(fn ($m) => $m->translated('body', $this->locale))
            ->filter(fn (?string $v) => $v !== null)->values()->all();
    }

    /** @return list<array{term: string|null, text: string}> */
    private function terms(?Collection $models): array
    {
        return ($models ?? collect())
            ->map(fn ($m) => ['term' => $m->translated('term', $this->locale), 'text' => $m->translated('body', $this->locale)])
            ->filter(fn (array $v) => $v['text'] !== null)->values()->all();
    }

    /** يُسقط الحقول غير المترجمة. @param array<string, mixed> $fields  @return array<string, mixed> */
    private function fields(array $fields): array
    {
        return array_filter($fields, fn ($v) => $v !== null && $v !== []);
    }

    /** @param array<string, mixed> $node */
    private function put(array &$node, string $key, mixed $value): void
    {
        if ($value !== null && $value !== []) {
            $node[$key] = $value;
        }
    }
}
