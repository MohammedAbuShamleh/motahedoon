<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;

/** نصّ واجهة. المفتاح هو النصّ العربي؛ ترجماته في translations (field = value). */
class UiString extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    protected $fillable = ['key', 'position'];

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }
}
