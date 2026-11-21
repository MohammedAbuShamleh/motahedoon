<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * ترتيب يدوي بعمود position.
 *
 * الترتيب في هذا الموقع قرار تحريري لا أبجدي ولا زمني (ترتيب الشركاء،
 * المجالات، بنود التقرير)، فكل جدول مرتّب يحمل position.
 * السجل الجديد بلا موضع يُلحَق آخر إخوته.
 */
trait HasPosition
{
    public static function bootHasPosition(): void
    {
        static::creating(function (self $model): void {
            if ($model->position !== null && $model->position !== 0) {
                return;
            }
            $siblings = static::query();
            foreach ($model->positionScope() as $column) {
                $siblings->where($column, $model->{$column});
            }
            $model->position = ((int) $siblings->max('position')) + 1;
        });
    }

    /**
     * الأعمدة التي تحدّد «الإخوة» في الترتيب (مثلاً report_id).
     * فارغة = الجدول كلّه قائمة واحدة.
     *
     * @return list<string>
     */
    protected function positionScope(): array
    {
        return [];
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('position')->orderBy('id');
    }
}
