<?php

namespace App\Models;

use App\Enums\ContentLineGroup;
use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;

/** سطر من المتن الدائم: قيمة، أو فقرة تأسيس، أو هدف، أو تطلّع، أو مقدّمة. */
class ContentLine extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    protected $fillable = ['group', 'term', 'body', 'position'];

    protected function casts(): array
    {
        return ['group' => ContentLineGroup::class, 'position' => 'integer'];
    }

    protected function positionScope(): array
    {
        return ['group'];
    }
}
