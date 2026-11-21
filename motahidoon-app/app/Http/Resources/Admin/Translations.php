<?php

namespace App\Http\Resources\Admin;

use App\Models\Translation;
use Illuminate\Database\Eloquent\Model;

/** قيم ترجمات نموذج لحقول نموذج التحرير: [locale => [field => value]]. */
final class Translations
{
    /** @param list<string> $fields  @return array<string, array<string, string|null>> */
    public static function of(Model $model, array $fields): array
    {
        $out = [];
        foreach (['en', 'tr'] as $locale) {
            foreach ($fields as $field) {
                $out[$locale][$field] = $model->translations
                    ->first(fn (Translation $t) => $t->locale->value === $locale && $t->field === $field)
                    ?->value;
            }
        }

        return $out;
    }
}
