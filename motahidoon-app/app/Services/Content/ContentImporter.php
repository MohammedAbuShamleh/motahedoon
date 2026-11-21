<?php

namespace App\Services\Content;

use App\Contracts\ContentSource;
use App\Enums\ContentLineGroup;
use App\Enums\ReportLineGroup;
use App\Enums\ReportStatus;
use App\Models\ContentLine;
use App\Models\FieldPhoto;
use App\Models\Partner;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\ReportSection;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\DB;

/**
 * المستورِد — ينقل الشجرة العربية من أي ContentSource (اليوم: ملفات JSON)
 * إلى القاعدة. أخطر قطعة في المرحلة ب، ولذلك:
 *   · لا يُطبَع فيه حرف محتوى واحد يدوياً؛ كل نصّ يُنسخ برمجياً من المصدر.
 *   · الكل داخل معاملة واحدة: إمّا يُستورَد المحتوى كاملاً أو لا شيء.
 *   · النتيجة تُقارَن بالمصدر بأمر content:verify.
 */
final class ContentImporter
{
    public function __construct(
        private readonly MediaRegistry $media,
        private readonly TranslationImporter $translations,
        private readonly ContentCache $cache,
    ) {}

    /** @param list<string> $locales */
    public function import(ContentSource $source, array $locales = ['en', 'tr']): void
    {
        $site = $source->base();

        $this->cache->batch(fn () => DB::transaction(function () use ($site, $source, $locales): void {
            $this->settings($site);
            $this->lines($site);
            $this->partners($site['partners']);
            $this->pillars($site['pillars']);
            $this->fieldPhotos($site['fieldPhotos']);
            $this->reports($site['reports']);

            foreach ($locales as $locale) {
                $overlay = $source->overlay($locale);
                if ($overlay !== null) {
                    $this->translations->import($locale, $overlay);
                }
            }
        }));
    }

    /** @param array<string, mixed> $site */
    private function settings(array $site): void
    {
        SiteSetting::query()->create([
            'name' => $site['org']['name'],
            'short_name' => $site['org']['shortName'],
            'tagline' => $site['org']['tagline'],
            'logo_full_media_id' => $this->media->register($site['org']['logoFull'], bw: false)?->id,
            'logo_mark_media_id' => $this->media->register($site['org']['logoMark'], bw: false)?->id,
            'vision' => $site['identity']['vision'],
            'mission' => $site['identity']['mission'],
            'founding_year' => $site['founding']['year'],
            'media_office' => $site['mediaOffice'],
            'governance' => $site['governance'],
            'contact_email' => $site['contact']['email'],
            'contact_phone' => $site['contact']['phone'],
            'contact_address' => $site['contact']['address'],
            'social' => $site['contact']['social'],
            'donate_url' => $site['donors']['donateUrl'],
            'donate_qr_media_id' => $this->media->register($site['donors']['donateQr'], bw: false)?->id,
            'donate_label' => $site['donors']['donateLabel'],
            'home_metrics_count' => $site['homeMetrics'],
        ]);
    }

    /** @param array<string, mixed> $site */
    private function lines(array $site): void
    {
        foreach ($site['identity']['values'] as $i => $v) {
            $this->line(ContentLineGroup::Value, $i, $v['text'], $v['term']);
        }
        $plain = [
            [ContentLineGroup::Story, $site['founding']['story']],
            [ContentLineGroup::Goal, $site['goals']],
            [ContentLineGroup::Aspiration, $site['aspirations']],
            [ContentLineGroup::Intro, $site['intro']],
        ];
        foreach ($plain as [$group, $bodies]) {
            foreach ($bodies as $i => $body) {
                $this->line($group, $i, $body);
            }
        }
    }

    private function line(ContentLineGroup $group, int $i, string $body, ?string $term = null): void
    {
        ContentLine::query()->create(['group' => $group, 'term' => $term, 'body' => $body, 'position' => $i + 1]);
    }

    /** @param list<array<string, mixed>> $partners */
    private function partners(array $partners): void
    {
        foreach ($partners as $i => $p) {
            Partner::query()->create([
                'slug' => $p['id'],
                'name' => $p['name'],
                'logo_media_id' => $this->media->register($p['logo'], bw: false)?->id,
                'site_url' => $p['site'],
                'role' => $p['role'],
                'about' => $p['about'],
                'position' => $i + 1,
            ]);
        }
    }

    /** @param list<array<string, mixed>> $pillars */
    private function pillars(array $pillars): void
    {
        foreach ($pillars as $i => $p) {
            Pillar::query()->create([
                'slug' => $p['id'],
                'num' => $p['num'],
                'title' => $p['title'],
                'short' => $p['short'],
                'orgs' => $p['orgs'],
                'definition' => $p['definition'],
                'cover_media_id' => $this->media->register($p['cover']['src'] ?? null)?->id,
                'cover_caption' => $p['cover']['caption'] ?? null,
                'position' => $i + 1,
            ]);
        }
    }

    /** @param list<string> $paths */
    private function fieldPhotos(array $paths): void
    {
        foreach ($paths as $i => $path) {
            FieldPhoto::query()->create(['media_id' => $this->media->register($path)->id, 'position' => $i + 1]);
        }
    }

    /** @param array{current: string|null, items: list<array<string, mixed>>} $reports */
    private function reports(array $reports): void
    {
        $pillarIds = Pillar::query()->pluck('id', 'slug');
        $now = now();

        /* بالعكس: الأقدم يُدرَج أولاً فيأخذ id أصغر، و«الأحدث أولاً»
           (published_at ثم id تنازلياً) يعيد ترتيب المصدر نفسه. */
        foreach (array_reverse($reports['items']) as $r) {
            $report = Report::query()->create([
                'slug' => $r['id'],
                'label' => $r['label'],
                'range' => $r['range'],
                'report_title' => $r['reportTitle'],
                'report_file_media_id' => $this->media->register($r['reportFile'] ?? null, bw: false)?->id,
                'metrics_title' => $r['metricsTitle'],
                'reading_title' => $r['reading']['title'] ?? null,
                'data_notes_title' => $r['dataNotes']['title'] ?? null,
                'opportunities_title' => $r['opportunities']['title'] ?? null,
                'closing_title' => $r['closing']['title'] ?? null,
                'closing_signoff' => $r['closing']['signoff'] ?? null,
                'appeal_title' => $r['appeal']['title'] ?? null,
                'appeal_lead' => $r['appeal']['lead'] ?? null,
                'appeal_photo_media_id' => $this->media->register($r['appeal']['photo']['src'] ?? null)?->id,
                'appeal_photo_caption' => $r['appeal']['photo']['caption'] ?? null,
                'status' => ReportStatus::Published,
                'published_at' => $now,
                'is_current' => $r['id'] === $reports['current'],
            ]);

            $this->reportLines($report, $r);

            foreach ($r['metrics'] as $i => $m) {
                $report->metrics()->create($this->figure($m, $i));
            }

            if (isset($r['summary'])) {
                $report->tables()->create($this->table($r['summary']) + ['position' => 1]);
            }

            $pos = 0;
            foreach ($r['sections'] as $slug => $sec) {
                $this->section($report, (int) $pillarIds[$slug], $sec, ++$pos);
            }
        }
    }

    /** @param array<string, mixed> $r */
    private function reportLines(Report $report, array $r): void
    {
        $plain = [
            [ReportLineGroup::Notice, $r['notice'] ?? []],
            [ReportLineGroup::Intro, $r['intro'] ?? []],
            [ReportLineGroup::Highlight, $r['highlights'] ?? []],
            [ReportLineGroup::Opportunity, $r['opportunities']['items'] ?? []],
            [ReportLineGroup::ClosingParagraph, $r['closing']['paragraphs'] ?? []],
            [ReportLineGroup::AppealItem, $r['appeal']['items'] ?? []],
        ];
        foreach ($plain as [$group, $bodies]) {
            foreach ($bodies as $i => $body) {
                $report->lines()->create(['group' => $group, 'body' => $body, 'position' => $i + 1]);
            }
        }
        $termed = [
            [ReportLineGroup::Reading, $r['reading']['items'] ?? []],
            [ReportLineGroup::DataNote, $r['dataNotes']['items'] ?? []],
        ];
        foreach ($termed as [$group, $items]) {
            foreach ($items as $i => $item) {
                $report->lines()->create([
                    'group' => $group, 'term' => $item['term'] ?? null, 'body' => $item['text'], 'position' => $i + 1,
                ]);
            }
        }
    }

    /** @param array<string, mixed> $sec */
    private function section(Report $report, int $pillarId, array $sec, int $position): void
    {
        /** @var ReportSection $section */
        $section = $report->sections()->create([
            'pillar_id' => $pillarId, 'lead' => $sec['lead'] ?? null, 'position' => $position,
        ]);

        foreach ($sec['groups'] ?? [] as $g => $group) {
            $row = $section->groups()->create([
                'num' => $group['num'] ?? null,
                'title' => $group['title'] ?? null,
                'is_recap' => $group['recap'] ?? false,
                'position' => $g + 1,
            ]);
            foreach ($group['items'] as $i => $item) {
                $row->items()->create([
                    'term' => $item['term'] ?? null,
                    'body' => $item['text'],
                    'is_recap' => $item['recap'] ?? false,
                    'position' => $i + 1,
                ]);
            }
        }

        foreach ($sec['blocks'] ?? [] as $b => $block) {
            $row = $section->blocks()->create([
                'title' => $block['title'],
                'note_term' => $block['note']['term'] ?? null,
                'note_body' => $block['note']['text'] ?? null,
                'position' => $b + 1,
            ]);
            foreach ($block['figures'] as $i => $f) {
                $row->figures()->create($this->figure($f, $i));
            }
        }

        if (isset($sec['table'])) {
            $section->table()->create($this->table($sec['table']) + ['report_id' => $report->id, 'position' => $position + 1]);
        }

        foreach ($sec['gallery'] ?? [] as $i => $photo) {
            $section->gallery()->create([
                'media_id' => $this->media->register($photo['src'])->id,
                'caption' => $photo['caption'],
                'position' => $i + 1,
            ]);
        }
    }

    /** @param array<string, mixed> $f  @return array<string, mixed> */
    private function figure(array $f, int $i): array
    {
        return [
            'value' => $f['value'],
            'prefix' => $f['prefix'] ?? null,
            'unit' => $f['unit'] ?? null,
            'label' => $f['label'],
            'accent' => $f['accent'] ?? false,
            'position' => $i + 1,
        ];
    }

    /** @param array<string, mixed> $t  @return array<string, mixed> */
    private function table(array $t): array
    {
        return [
            'title' => $t['title'] ?? null,
            'head' => $t['head'],
            'rows' => $t['rows'],
            'foot' => $t['foot'] ?? null,
            'foot_note' => $t['footNote'] ?? null,
        ];
    }
}
