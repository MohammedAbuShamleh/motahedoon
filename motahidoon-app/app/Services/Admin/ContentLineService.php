<?php

namespace App\Services\Admin;

use App\Enums\ContentLineGroup;
use App\Models\ContentLine;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class ContentLineService
{
    public function __construct(private readonly TranslationService $translations) {}

    /** @return Collection<int, ContentLine> كل الأسطر بترتيبها، مع ترجماتها */
    public function listing(): Collection
    {
        return ContentLine::query()->ordered()->with('translations')->get();
    }

    /** @param array<string, mixed> $data */
    public function create(array $data, User $by): ContentLine
    {
        return DB::transaction(function () use ($data, $by): ContentLine {
            $group = ContentLineGroup::from($data['group']);
            $line = ContentLine::query()->create([
                'group' => $group,
                'term' => $group->hasTerm() ? ($data['term'] ?? null) : null,
                'body' => $data['body'],
                'position' => $data['position'] ?? null,
            ]);
            $this->translations->syncFields($line, $data['translations'] ?? null, ['term', 'body'], $by);

            return $line;
        });
    }

    /** @param array<string, mixed> $data */
    public function update(ContentLine $line, array $data, User $by): void
    {
        DB::transaction(function () use ($line, $data, $by): void {
            $line->update([
                'term' => $line->group->hasTerm() ? ($data['term'] ?? null) : null,
                'body' => $data['body'],
                'position' => $data['position'] ?? $line->position,
            ]);
            $this->translations->syncFields($line, $data['translations'] ?? null, ['term', 'body'], $by);
        });
    }

    /** الحذف خطوتان (ترجمات السجل في حدث deleting، ثم السجل) — فهو معاملة واحدة */
    public function delete(ContentLine $line): void
    {
        DB::transaction(fn () => $line->delete());
    }
}
