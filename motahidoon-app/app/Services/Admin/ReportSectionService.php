<?php

namespace App\Services\Admin;

use App\Models\Pillar;
use App\Models\Report;
use App\Models\ReportBlock;
use App\Models\ReportGroup;
use App\Models\ReportSection;
use App\Models\User;
use App\Services\Media\MediaService;
use App\Traits\SyncsChildren;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** قسم مجال داخل تقرير: الافتتاحية، والمجموعات، وكتل الأرقام، والجدول، والمعرض. */
final class ReportSectionService
{
    use SyncsChildren;

    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
    ) {}

    /** القسم جاهزاً لمحرّره: تقريره ومجاله ومجموعاته وكتله وجدوله ومعرضه وترجماته محمَّلة */
    public function forEdit(ReportSection $section): ReportSection
    {
        return $section->load(['report', 'pillar', 'groups.items', 'blocks.figures', 'table', 'gallery.media', 'translations']);
    }

    public function create(Report $report, int $pillarId): ReportSection
    {
        return $report->sections()->create(['pillar_id' => $pillarId]);
    }

    /** الطريق نفسه من صفحة المجال: التقرير معرّفاً والمجال نموذجاً */
    public function createFor(int $reportId, Pillar $pillar): ReportSection
    {
        return $this->create(Report::query()->findOrFail($reportId), $pillar->id);
    }

    /** @param array<string, mixed> $data */
    public function update(ReportSection $section, array $data, User $by): void
    {
        DB::transaction(function () use ($section, $data, $by): void {
            $section->update(['lead' => $data['lead'] ?? null, 'stats' => self::stats($data['stats'] ?? null)]);

            $this->syncChildren($section->groups(), $data['groups'] ?? [], fn (array $g) => [
                'num' => $g['num'] ?? null,
                'title' => $g['title'] ?? null,
                'is_recap' => (bool) ($g['is_recap'] ?? false),
                'stats' => self::stats($g['stats'] ?? null),
            ], function (Model $group, array $g): void {
                /** @var ReportGroup $group */
                $this->syncChildren($group->items(), $g['items'] ?? [], fn (array $i) => [
                    'term' => $i['term'] ?? null,
                    'body' => $i['body'],
                    'is_recap' => (bool) ($i['is_recap'] ?? false),
                ]);
            });

            $this->syncChildren($section->blocks(), $data['blocks'] ?? [], fn (array $b) => [
                'title' => $b['title'],
                'note_term' => $b['note_term'] ?? null,
                'note_body' => $b['note_body'] ?? null,
            ], function (Model $block, array $b): void {
                /** @var ReportBlock $block */
                $this->syncChildren($block->figures(), $b['figures'] ?? [], fn (array $f) => [
                    'value' => $f['value'],
                    'prefix' => $f['prefix'] ?? null,
                    'unit' => $f['unit'] ?? null,
                    'label' => $f['label'],
                    'accent' => (bool) ($f['accent'] ?? false),
                ]);
            });

            $this->syncTable($section, $data['table'] ?? null);

            $this->syncChildren($section->gallery(), $data['gallery'] ?? [], fn (array $p) => [
                // صورة المعرض ميدانية: ترفع أبيض وأسود
                'media_id' => isset($p['file'])
                    ? $this->media->upload($p['file'], true, $by->id)->id
                    : (int) $p['media_id'],
                'caption' => $p['caption'],
            ]);

            $this->translations->syncFields($section, $data['translations'] ?? null, ['lead'], $by);
        });
    }

    /**
     * بطاقات الأرقام كما كُتبت: {value, unit} مقصوصة الأطراف. القائمة الفارغة
     * null — فيعود العرض إلى الاستخراج التلقائي من البنود.
     *
     * @param  list<array<string, mixed>>|null  $rows
     * @return list<array{value: string, unit: string}>|null
     */
    private static function stats(?array $rows): ?array
    {
        $out = collect($rows ?? [])
            ->map(fn (array $r) => ['value' => trim((string) $r['value']), 'unit' => trim((string) $r['unit'])])
            ->filter(fn (array $r) => $r['value'] !== '' && $r['unit'] !== '')
            ->values()->all();

        return $out === [] ? null : $out;
    }

    public function delete(ReportSection $section): void
    {
        DB::transaction(function () use ($section): void {
            $section->delete();   // ترجماته تُحذف عبر HasTranslations
        });
    }

    /** @param array<string, mixed>|null $table */
    private function syncTable(ReportSection $section, ?array $table): void
    {
        $existing = $section->table()->first();

        if ($table === null || ($table['head'] ?? []) === []) {
            $existing?->delete();

            return;
        }
        $attrs = TableData::from($table);
        $existing
            ? $existing->update($attrs)
            : $section->table()->create($attrs + ['report_id' => $section->report_id]);
    }
}
