<?php

namespace App\Services\Admin;

use App\Enums\TranslationStatus;
use App\Models\Media;
use App\Models\Partner;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\Translation;

final class DashboardService
{
    /** @return array<string, mixed> */
    public function summary(): array
    {
        $queue = Translation::query()
            ->selectRaw('locale, status, count(*) as n')
            ->groupBy('locale', 'status')->get()
            ->map(fn (Translation $t) => [
                'locale' => $t->locale->value,
                'status' => $t->status->value,
                'label' => $t->status->label(),
                'n' => (int) $t->getAttribute('n'),
            ]);

        return [
            'counts' => [
                'partners' => Partner::query()->count(),
                'pillars' => Pillar::query()->count(),
                'reports' => Report::query()->count(),
                'media' => Media::query()->count(),
            ],
            'current' => Report::query()->where('is_current', true)->value('label'),
            'translations' => $queue->values()->all(),
            'emptyPillarDefinitions' => Pillar::query()->whereNull('definition')->count(),
        ];
    }
}
