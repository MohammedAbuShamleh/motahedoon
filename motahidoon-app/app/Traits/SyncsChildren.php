<?php

namespace App\Traits;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * مزامنة قائمة أبناء مرتّبة من نموذج يرسل القائمة كاملة.
 *
 * لماذا لا «احذف الكلّ وأعِد الإدراج»: الأبناء تحمل ترجمات (translations
 * متعدّدة الأشكال بالمعرّف). الصفّ الذي يرسل id يُحدَّث في مكانه فتبقى
 * ترجمته؛ الجديد يُنشأ؛ وما غاب عن القائمة يُحذف — وحذفه بالنموذج
 * لا بالاستعلام، فتُحذف ترجماته معه (HasTranslations).
 *
 * يُستدعى داخل DB::transaction دائماً.
 */
trait SyncsChildren
{
    /**
     * @param  list<array<string, mixed>>  $rows
     * @param  Closure(array<string, mixed>, int): array<string, mixed>  $attributes
     * @param  (Closure(Model, array<string, mixed>): void)|null  $after  لمزامنة الأحفاد
     */
    protected function syncChildren(HasMany $relation, array $rows, Closure $attributes, ?Closure $after = null): void
    {
        $existing = (clone $relation)->get()->keyBy('id');
        $kept = [];

        foreach (array_values($rows) as $i => $row) {
            $attrs = $attributes($row, $i) + ['position' => $i + 1];
            $id = isset($row['id']) ? (int) $row['id'] : null;

            if ($id !== null && $existing->has($id)) {
                $child = $existing->get($id);
                $child->update($attrs);
            } else {
                $child = $relation->create($attrs);
            }
            $kept[] = $child->id;

            if ($after !== null) {
                $after($child, $row);
            }
        }

        $existing->except($kept)->each(fn (Model $m) => $m->delete());
    }
}
