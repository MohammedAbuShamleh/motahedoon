<?php

namespace App\Services\Admin;

use App\Models\UiString;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class UiStringService
{
    public function __construct(private readonly TranslationService $translations) {}

    /** @return Collection<int, UiString> نصوص الواجهة بترتيبها، مع ترجماتها */
    public function listing(): Collection
    {
        return UiString::query()->ordered()->with('translations')->get();
    }

    /** @param array<string, mixed> $data */
    public function save(?UiString $ui, array $data, User $by): UiString
    {
        return DB::transaction(function () use ($ui, $data, $by): UiString {
            $ui ??= UiString::query()->create(['key' => $data['key']]);
            $this->translations->syncFields($ui, $data['translations'] ?? null, ['value'], $by);

            return $ui;
        });
    }

    /** الحذف خطوتان (ترجمات النصّ في حدث deleting، ثم النصّ) — فهو معاملة واحدة */
    public function delete(UiString $ui): void
    {
        DB::transaction(fn () => $ui->delete());
    }
}
