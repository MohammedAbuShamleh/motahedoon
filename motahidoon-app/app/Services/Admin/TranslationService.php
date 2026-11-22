<?php

namespace App\Services\Admin;

use App\Enums\TranslationStatus;
use App\Models\Translation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** كتابة الترجمات واعتمادها، وطابور المراجعة. */
final class TranslationService
{
    /**
     * يزامن ترجمات حقول نموذج من نموذج التحرير.
     * الفارغ يحذف الترجمة؛ المتغيّر يُكتب بحالة pending (يد بشرية تنتظر
     * الاعتماد)؛ غير المتغيّر يُترك بحالته.
     *
     * @param  array<string, array<string, string|null>>|null  $input  [locale => [field => value]]
     * @param  list<string>  $fields
     */
    public function syncFields(Model $model, ?array $input, array $fields, ?User $by): void
    {
        if ($input === null) {
            return;
        }
        $existing = $model->translations()->get()->keyBy(fn (Translation $t) => $t->locale->value.'.'.$t->field);

        foreach (['en', 'tr'] as $locale) {
            foreach ($fields as $field) {
                $value = $input[$locale][$field] ?? null;
                $current = $existing->get("{$locale}.{$field}");

                if ($value === null || trim($value) === '') {
                    $current?->delete();
                } elseif ($current === null) {
                    $model->translations()->create([
                        'field' => $field, 'locale' => $locale, 'value' => $value,
                        'status' => TranslationStatus::Pending, 'translated_by' => $by?->id,
                    ]);
                } elseif ($current->value !== $value) {
                    $current->update([
                        'value' => $value, 'status' => TranslationStatus::Pending,
                        'translated_by' => $by?->id, 'reviewed_by' => null, 'reviewed_at' => null,
                    ]);
                }
            }
        }
    }

    public function update(Translation $translation, string $value, User $by): void
    {
        if ($translation->value === $value) {
            return;
        }
        $translation->update([
            'value' => $value, 'status' => TranslationStatus::Pending,
            'translated_by' => $by->id, 'reviewed_by' => null, 'reviewed_at' => null,
        ]);
    }

    /** @param list<int> $ids */
    public function approve(array $ids, User $by): int
    {
        return DB::transaction(function () use ($ids, $by): int {
            $rows = Translation::query()->whereIn('id', $ids)
                ->where('status', '!=', TranslationStatus::Approved)->get();
            // بالنموذج لا بالاستعلام الجماعي: كل حفظ يُبطل مخبأ المحتوى
            $rows->each(fn (Translation $t) => $t->update([
                'status' => TranslationStatus::Approved, 'reviewed_by' => $by->id, 'reviewed_at' => now(),
            ]));

            return $rows->count();
        });
    }

    /** يحذف ترجمات سجلات حُذفت بقيد cascade في القاعدة (لا تمرّ بأحداث النماذج). @param iterable<Model> $models */
    public function purge(iterable $models): void
    {
        foreach ($models as $model) {
            Translation::query()
                ->where('translatable_type', $model->getMorphClass())
                ->where('translatable_id', $model->getKey())
                ->delete();
        }
    }

    /** @param array{locale?: string|null, status?: string|null, type?: string|null, q?: string|null} $filters */
    public function queue(array $filters): LengthAwarePaginator
    {
        return Translation::query()
            ->with('translatable')
            ->when($filters['locale'] ?? null, fn ($q, $v) => $q->where('locale', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->where('translatable_type', $v))
            ->when($filters['q'] ?? null, fn ($q, $v) => $q->where('value', 'like', '%'.addcslashes($v, '%_').'%'))
            ->orderBy('id')
            ->paginate(40)
            ->withQueryString();
    }

    /** النصّ العربي المقابل للترجمة، لعرضه بجانبها. */
    public function source(Translation $t): ?string
    {
        $model = $t->translatable;

        return match (true) {
            $model === null => null,
            $t->field === 'value' && $model->getMorphClass() === 'ui_string' => $model->key,
            $t->field === 'stats' => '— أرقام القسم بوحداتها (JSON) —',
            $t->field === 'detail' => '— التفاصيل الكاملة للقسم بترتيب العربية (JSON) —',
            $t->field === 'unapproved_notice' => '— تنويه الترجمة غير المعتمدة —',
            default => (string) $model->getAttribute($t->field),
        };
    }
}
