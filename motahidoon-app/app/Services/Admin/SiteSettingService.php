<?php

namespace App\Services\Admin;

use App\Http\Requests\Admin\SiteSettingRequest;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Media\MediaService;
use Illuminate\Support\Facades\DB;

final class SiteSettingService
{
    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
    ) {}

    /** الإعدادات جاهزةً لنموذج التحرير: الشعاران وكود QR والترجمات محمَّلة */
    public function forEdit(): SiteSetting
    {
        return SiteSetting::query()->with(['logoFull', 'logoMark', 'donateQr', 'translations'])->firstOrFail();
    }

    /** @param array<string, mixed> $data */
    public function update(array $data, User $by): SiteSetting
    {
        return DB::transaction(function () use ($data, $by): SiteSetting {
            $s = SiteSetting::current();
            $s->update([
                ...collect($data)->only([
                    'name', 'short_name', 'tagline', 'vision', 'mission', 'founding_year', 'media_office',
                    'governance', 'contact_email', 'contact_phone', 'contact_address', 'donate_url',
                    'donate_label', 'home_metrics_count',
                ])->all(),
                'logo_full_media_id' => $this->image($data, 'logo_full', $s->logo_full_media_id, $by),
                'logo_mark_media_id' => $this->image($data, 'logo_mark', $s->logo_mark_media_id, $by),
                'donate_qr_media_id' => $this->image($data, 'donate_qr', $s->donate_qr_media_id, $by),
            ]);
            $this->translations->syncFields($s, $data['translations'] ?? null, SiteSettingRequest::TRANSLATABLE, $by);

            return $s;
        });
    }

    /** @param array<string, mixed> $data */
    private function image(array $data, string $field, ?int $current, User $by): ?int
    {
        // الشعارات ورمز QR ملوّنة: لا تحويل أبيض وأسود
        return $this->media->replace($data[$field] ?? null, $current, (bool) ($data["remove_{$field}"] ?? false), false, $by->id);
    }
}
