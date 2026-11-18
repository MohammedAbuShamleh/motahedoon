<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** مؤشّر. value نصّ لا عدد — الأرقام تُستنسخ حرفياً ولا يُعاد تنسيقها. */
class ReportMetric extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    protected $fillable = ['report_id', 'value', 'prefix', 'unit', 'label', 'accent', 'position'];

    protected function casts(): array
    {
        return ['accent' => 'boolean', 'position' => 'integer'];
    }

    protected function positionScope(): array
    {
        return ['report_id'];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
