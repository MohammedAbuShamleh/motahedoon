<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * عدّادات الزيارات اليومية: الكتابة من الواجهة العامة، والقراءة للوحة.
 * انظر ترحيل create_stats_tables لقاعدة الخصوصية.
 */
final class VisitStats
{
    /** برامج الزحف والفحص الآلي: لا تُعدّ */
    private const BOTS = '/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|headless|lighthouse|monitor/i';

    public function isBot(?string $userAgent): bool
    {
        return $userAgent === null || $userAgent === '' || preg_match(self::BOTS, $userAgent) === 1;
    }

    /** مسار نظيف: بلا استعلام ولا شرطة أخيرة، ولا صفحات اللوحة. null = لا يُعدّ */
    public function normalize(string $path): ?string
    {
        $path = '/'.trim((string) parse_url($path, PHP_URL_PATH), '/');
        if ($path === '/admin' || str_starts_with($path, '/admin/') || strlen($path) > 191) {
            return null;
        }

        return preg_match('#^/[\p{L}\p{N}/_\-.]*$#u', $path) === 1 ? $path : null;
    }

    /** مشاهدة صفحة، وزائر فريد إن لم يُعدّ في هذه الصفحة اليوم */
    public function pageView(string $path, string $locale, string $visitor): void
    {
        $day = CarbonImmutable::today()->toDateString();

        DB::transaction(function () use ($day, $path, $locale, $visitor): void {
            $fresh = DB::table('stat_visitor_hits')->insertOrIgnore([
                'day' => $day, 'visitor' => $visitor, 'path' => $path,
            ]) > 0;

            DB::statement(
                'INSERT INTO stat_page_days (day, path, locale, views, visitors) VALUES (?, ?, ?, 1, ?)
                 ON DUPLICATE KEY UPDATE views = views + 1, visitors = visitors + VALUES(visitors)',
                [$day, $path, $locale, $fresh ? 1 : 0],
            );
        });

        // تفريغ البصمات القديمة أحياناً: لا حاجة إليها بعد يومها
        if (random_int(1, 200) === 1) {
            DB::table('stat_visitor_hits')->where('day', '<', CarbonImmutable::today()->subDay()->toDateString())->delete();
        }
    }

    /** @param list<string> $sections أقسام ظهرت على الشاشة في هذه الزيارة */
    public function sectionViews(string $path, array $sections): void
    {
        $day = CarbonImmutable::today()->toDateString();
        foreach ($sections as $section) {
            DB::statement(
                'INSERT INTO stat_section_days (day, path, section, views) VALUES (?, ?, ?, 1)
                 ON DUPLICATE KEY UPDATE views = views + 1',
                [$day, $path, $section],
            );
        }
    }

    /**
     * ملخّص اللوحة لآخر $days يوماً.
     *
     * @return array<string, mixed>
     */
    public function summary(int $days): array
    {
        $to = CarbonImmutable::today();
        $from = $to->subDays($days - 1);
        $range = [$from->toDateString(), $to->toDateString()];

        $pages = DB::table('stat_page_days')->whereBetween('day', $range);

        $byDay = (clone $pages)->selectRaw('day, SUM(views) v, SUM(visitors) u')->groupBy('day')->get()
            ->keyBy(fn ($r) => (string) $r->day);
        $series = [];
        for ($d = $from; $d->lte($to); $d = $d->addDay()) {
            $row = $byDay->get($d->toDateString());
            $series[] = ['day' => $d->toDateString(), 'views' => (int) ($row->v ?? 0), 'visitors' => (int) ($row->u ?? 0)];
        }

        return [
            'days' => $days,
            'totals' => [
                'views' => (int) (clone $pages)->sum('views'),
                'visitors' => (int) (clone $pages)->sum('visitors'),
                'today' => (int) DB::table('stat_page_days')->where('day', $to->toDateString())->sum('views'),
            ],
            'series' => $series,
            'pages' => (clone $pages)->selectRaw('path, SUM(views) views, SUM(visitors) visitors')
                ->groupBy('path')->orderByDesc('views')->limit(50)->get()
                ->map(fn ($r) => ['path' => $r->path, 'views' => (int) $r->views, 'visitors' => (int) $r->visitors])->all(),
            'locales' => (clone $pages)->selectRaw('locale, SUM(views) views')->groupBy('locale')->orderByDesc('views')->get()
                ->map(fn ($r) => ['locale' => $r->locale, 'views' => (int) $r->views])->all(),
            'sections' => DB::table('stat_section_days')->whereBetween('day', $range)
                ->selectRaw('path, section, SUM(views) views')->groupBy('path', 'section')
                ->orderBy('path')->orderByDesc('views')->get()
                ->map(fn ($r) => ['path' => $r->path, 'section' => $r->section, 'views' => (int) $r->views])->all(),
        ];
    }
}
