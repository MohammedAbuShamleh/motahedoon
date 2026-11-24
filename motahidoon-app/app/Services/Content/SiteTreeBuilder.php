<?php

namespace App\Services\Content;

use App\Enums\ContentLineGroup;
use App\Models\ContentLine;
use App\Models\FieldPhoto;
use App\Models\Partner;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\SiteSetting;
use Illuminate\Support\Collection;

/**
 * يبني الشجرة العربية من القاعدة بالشكل ذاته الذي كان في site.ar.json
 * حرفاً بحرف: المفاتيح الدائمة تبقى حتى لو كانت null (الخانة المحجوزة
 * تُرسَم ولا تُخفى)، والاختيارية لا تظهر إلا إن وُجدت قيمتها.
 *
 * التطابق مُتحقَّق منه بأمر php artisan content:verify.
 */
final class SiteTreeBuilder
{
    public function __construct(private readonly ReportTreeBuilder $reports) {}

    /** @return array<string, mixed> */
    public function build(): array
    {
        $s = SiteSetting::query()->with(['logoFull', 'logoMark', 'donateQr'])->firstOrFail();
        $lines = ContentLine::query()->ordered()->get()->groupBy(fn (ContentLine $l) => $l->group->value);
        $body = fn (ContentLineGroup $g): array => $this->bodies($lines->get($g->value));

        $reports = Report::query()->published()->latestFirst()
            ->with(ReportTreeBuilder::RELATIONS)->get();

        return [
            'org' => [
                'name' => $s->name,
                'shortName' => $s->short_name,
                'tagline' => $s->tagline,
                'logoFull' => $s->logoFull?->path,
                'logoMark' => $s->logoMark?->path,
            ],
            'identity' => [
                'vision' => $s->vision,
                'mission' => $s->mission,
                'values' => ($lines->get(ContentLineGroup::Value->value) ?? collect())
                    ->map(fn (ContentLine $l) => ['term' => $l->term, 'text' => $l->body])
                    ->values()->all(),
            ],
            'founding' => [
                'year' => $s->founding_year,
                'story' => $body(ContentLineGroup::Story),
            ],
            'goals' => $body(ContentLineGroup::Goal),
            'aspirations' => $body(ContentLineGroup::Aspiration),
            'governance' => $s->governance,
            'partners' => $this->partners(),
            'mediaOffice' => $s->media_office,
            'intro' => $body(ContentLineGroup::Intro),
            'pillars' => $this->pillars(),
            'homeMetrics' => $s->home_metrics_count,
            'fieldPhotos' => FieldPhoto::query()->ordered()->with('media')->get()
                ->map(fn (FieldPhoto $p) => $p->media->path)->all(),
            'reports' => [
                'current' => $reports->firstWhere('is_current', true)?->slug,
                'items' => $reports->map(fn (Report $r) => $this->reports->build($r))->all(),
            ],
            'donors' => [
                'donateUrl' => $s->donate_url,
                'donateQr' => $s->donateQr?->path,
                'donateLabel' => $s->donate_label,
            ],
            'contact' => [
                'email' => $s->contact_email,
                'phone' => $s->contact_phone,
                'address' => $s->contact_address,
                'social' => collect(SiteSetting::SOCIAL)
                    ->mapWithKeys(fn (string $k) => [$k => $s->social[$k] ?? null])->all(),
            ],
        ];
    }

    /** @return list<string> */
    private function bodies(?Collection $lines): array
    {
        return ($lines ?? collect())->pluck('body')->values()->all();
    }

    /** @return list<array<string, mixed>> */
    private function partners(): array
    {
        return Partner::query()->where('is_published', true)->ordered()->with('logo')->get()
            ->map(fn (Partner $p) => [
                'id' => $p->slug,
                'name' => $p->name,
                'logo' => $p->logo?->path,
                'site' => $p->site_url,
                'role' => $p->role,
                'about' => $p->about,
            ])->all();
    }

    /** @return list<array<string, mixed>> */
    private function pillars(): array
    {
        return Pillar::query()->where('is_published', true)->ordered()->with('cover')->get()
            ->map(fn (Pillar $p) => [
                'id' => $p->slug,
                'num' => $p->num,
                'title' => $p->title,
                'short' => $p->short,
                'orgs' => $p->orgs,
                'definition' => RichText::clean($p->definition),
                'cover' => $p->cover === null ? null : [
                    'src' => $p->cover->path,
                    'caption' => $p->cover_caption,
                ],
            ])->all();
    }
}
