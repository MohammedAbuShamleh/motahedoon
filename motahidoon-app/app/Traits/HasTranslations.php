<?php

namespace App\Traits;

use App\Models\Translation;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * حقول قابلة للترجمة عبر جدول translations متعدّد الأشكال.
 *
 * العربية تبقى في الأعمدة الأساسية؛ هذا الـtrait لا يمسّها. ويُحذف ما
 * يخصّ السجل من ترجمات عند حذفه، فلا تبقى ترجمات يتيمة.
 */
trait HasTranslations
{
    public static function bootHasTranslations(): void
    {
        static::deleting(function (self $model): void {
            $model->translations()->delete();
        });
    }

    public function translations(): MorphMany
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    /** قيمة الحقل باللغة، أو null. تفترض أن العلاقة محمَّلة مسبقاً. */
    public function translated(string $field, string $locale): ?string
    {
        return $this->translations
            ->first(fn (Translation $t) => $t->field === $field && $t->locale->value === $locale)
            ?->value;
    }
}
