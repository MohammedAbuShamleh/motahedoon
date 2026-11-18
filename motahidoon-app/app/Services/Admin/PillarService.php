<?php

namespace App\Services\Admin;

use App\Http\Requests\Admin\PillarRequest;
use App\Models\Pillar;
use App\Models\User;
use App\Services\Media\MediaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class PillarService
{
    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
    ) {}

    /** @param array<string, mixed> $data */
    public function save(?Pillar $pillar, array $data, User $by): Pillar
    {
        return DB::transaction(function () use ($pillar, $data, $by): Pillar {
            $pillar ??= new Pillar;
            // الرقم الفارغ يأخذ التالي تلقائياً
            $data['num'] = ($data['num'] ?? null) ?: ($pillar->num ?? $this->nextNum());
            $pillar->fill([
                ...collect($data)->only(['slug', 'num', 'title', 'short', 'orgs', 'definition', 'cover_caption', 'is_published'])->all(),
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

    /** المجال الذي تذكره تقارير لا يُحذف: الحذف يُسقط أقسامها معه (cascade). */
    public function delete(Pillar $pillar): void
    {
        if ($pillar->reportSections()->exists()) {
            throw ValidationException::withMessages([
                'pillar' => 'لهذا المجال أقسام في تقارير منشورة. أخفِه بإلغاء النشر بدل حذفه.',
            ]);
        }
        $pillar->delete();
    }
}
