<?php

namespace App\Services\Admin;

use App\Models\UiString;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class UiStringService
{
    public function __construct(private readonly TranslationService $translations) {}

    /** @param array<string, mixed> $data */
    public function save(?UiString $ui, array $data, User $by): UiString
    {
        return DB::transaction(function () use ($ui, $data, $by): UiString {
            $ui ??= UiString::query()->create(['key' => $data['key']]);
            $this->translations->syncFields($ui, $data['translations'] ?? null, ['value'], $by);

            return $ui;
        });
    }

    public function delete(UiString $ui): void
    {
        $ui->delete();
    }
}
