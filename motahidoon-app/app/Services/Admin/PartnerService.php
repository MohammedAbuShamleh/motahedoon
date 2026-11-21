<?php

namespace App\Services\Admin;

use App\Models\Partner;
use App\Models\User;
use App\Services\Media\MediaService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class PartnerService
{
    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
    ) {}

    /** @return Collection<int, Partner> قائمة اللوحة بترتيب العرض، مع الشعار */
    public function listing(): Collection
    {
        return Partner::query()->ordered()->with('logo')->get();
    }

    /** الشريك جاهزاً لنموذج التحرير: الشعار والترجمات محمَّلة */
    public function forEdit(Partner $partner): Partner
    {
        return $partner->load(['logo', 'translations']);
    }

    /** @param array<string, mixed> $data */
    public function save(?Partner $partner, array $data, User $by): Partner
    {
        return DB::transaction(function () use ($partner, $data, $by): Partner {
            $partner ??= new Partner;
            $partner->fill([
                ...collect($data)->only(['slug', 'name', 'site_url', 'role', 'about', 'is_published'])->all(),
                'position' => $data['position'] ?? $partner->position,
                'logo_media_id' => $this->media->replace(
                    $data['logo'] ?? null, $partner->logo_media_id, (bool) ($data['remove_logo'] ?? false), false, $by->id
                ),
            ])->save();
            $this->translations->syncFields($partner, $data['translations'] ?? null, ['name'], $by);

            return $partner;
        });
    }

    /** الحذف خطوتان (ترجمات الشريك في حدث deleting، ثم الشريك) — فهو معاملة واحدة */
    public function delete(Partner $partner): void
    {
        DB::transaction(fn () => $partner->delete());
    }
}
