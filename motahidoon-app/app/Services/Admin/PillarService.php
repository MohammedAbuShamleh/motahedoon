<?php

namespace App\Services\Admin;

use App\Http\Requests\Admin\PillarDetailsRequest;
use App\Http\Requests\Admin\PillarRequest;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\User;
use App\Services\Media\MediaService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class PillarService
{
    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
    ) {}

    /** @return Collection<int, Pillar> قائمة اللوحة بترتيب العرض، مع الغلاف */
    public function listing(): Collection
    {
        return Pillar::query()->ordered()->with('cover')->get();
    }

    /** المجال جاهزاً لنموذج التحرير: الغلاف والترجمات محمَّلة */
    public function forEdit(Pillar $pillar): Pillar
    {
        return $pillar->load(['cover', 'translations']);
    }

    /**
     * صفحة التفاصيل: التعريف وترجماته، وكل قسم للمجال في التقارير بمحتواه
     * كاملاً — الأحدث أولاً، والمعرّف يكسر التعادل فيثبت الترتيب.
     */
    public function forDetails(Pillar $pillar): Pillar
    {
        return $pillar->load([
            'translations',
            'reportSections' => fn ($q) => $q
                ->join('reports', 'reports.id', '=', 'report_sections.report_id')
                ->orderByDesc('reports.published_at')->orderByDesc('reports.id')
                ->select('report_sections.*')
                ->with(['report', 'pillar', 'groups.items', 'blocks.figures', 'table', 'gallery.media', 'translations']),
        ]);
    }

    /** @return Collection<int, Report> التقارير التي لا قسم فيها لهذا المجال بعد */
    public function reportsWithout(Pillar $pillar): Collection
    {
        return Report::query()
            ->whereDoesntHave('sections', fn ($q) => $q->where('pillar_id', $pillar->id))
            ->latestFirst()->get(['id', 'label']);
    }

    /** @param array<string, mixed> $data */
    public function saveDefinition(Pillar $pillar, array $data, User $by): void
    {
        DB::transaction(function () use ($pillar, $data, $by): void {
            $pillar->update(['definition' => $data['definition'] ?? null]);
            $this->translations->syncFields($pillar, $data['translations'] ?? null, PillarDetailsRequest::TRANSLATABLE, $by);
        });
    }

    /** @return Collection<int, Pillar> المجالات خياراتٍ لقائمة منسدلة (المعرّف والاسم المختصر) */
    public function options(): Collection
    {
        return Pillar::query()->ordered()->get(['id', 'short']);
    }

    /** @param array<string, mixed> $data */
    public function save(?Pillar $pillar, array $data, User $by): Pillar
    {
        return DB::transaction(function () use ($pillar, $data, $by): Pillar {
            $pillar ??= new Pillar;
            // الرقم الفارغ يأخذ التالي تلقائياً
            $data['num'] = ($data['num'] ?? null) ?: ($pillar->num ?? $this->nextNum());
            $pillar->fill([
                ...collect($data)->only(['slug', 'num', 'title', 'short', 'orgs', 'cover_caption', 'is_published'])->all(),
                'position' => $data['position'] ?? $pillar->position,
                // غلاف المجال صورة ميدانية: أبيض وأسود في الملف
                'cover_media_id' => $this->media->replace(
                    $data['cover'] ?? null, $pillar->cover_media_id, (bool) ($data['remove_cover'] ?? false), true, $by->id
                ),
            ])->save();
            $this->translations->syncFields($pillar, $data['translations'] ?? null, PillarRequest::TRANSLATABLE, $by);

            return $pillar;
        });
    }

    /**
     * رقم المجال التالي: أكبر رقم موجود + 1، بعدد خانات الأرقام الحالية
     * (07 ← 08). يُحسب من القيم لا من العدد: حذف مجال لا يكرّر رقماً.
     */
    public function nextNum(): string
    {
        $nums = Pillar::query()->pluck('num');
        $max = (int) $nums->map(fn (string $n) => (int) $n)->max();
        $width = max(2, (int) $nums->map(fn (string $n) => strlen($n))->max());

        return str_pad((string) ($max + 1), $width, '0', STR_PAD_LEFT);
    }

    /**
     * المجال الذي تذكره تقارير لا يُحذف: الحذف يُسقط أقسامها معه (cascade).
     * الفحص والحذف (وترجماته في حدث deleting) معاملة واحدة، فلا يتسلّل قسم
     * جديد بين الفحص والحذف ولا يبقى المجال بلا ترجماته إن فشل الحذف.
     */
    public function delete(Pillar $pillar): void
    {
        DB::transaction(function () use ($pillar): void {
            if ($pillar->reportSections()->exists()) {
                throw ValidationException::withMessages([
                    'pillar' => 'لهذا المجال أقسام في تقارير منشورة. أخفِه بإلغاء النشر بدل حذفه.',
                ]);
            }
            $pillar->delete();
        });
    }
}
