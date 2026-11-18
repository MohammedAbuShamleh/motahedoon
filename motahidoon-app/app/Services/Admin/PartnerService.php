<?php

namespace App\Services\Admin;

use App\Models\Partner;
use App\Models\User;
use App\Services\Media\MediaService;
use Illuminate\Support\Facades\DB;

final class PartnerService
{
    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
    ) {}

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

    public function delete(Partner $partner): void
    {
        $partner->delete();
    }
}
