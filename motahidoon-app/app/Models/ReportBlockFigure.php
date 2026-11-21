<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** رقم داخل كتلة. value نصّ لا عدد — قاعدة الحرفية. */
class ReportBlockFigure extends Model
{
    use FlushesContentCache, HasPosition;

    protected $fillable = ['report_block_id', 'value', 'prefix', 'unit', 'label', 'accent', 'position'];

    protected function casts(): array
    {
        return ['accent' => 'boolean', 'position' => 'integer'];
    }

    protected function positionScope(): array
    {
        return ['report_block_id'];
    }

    public function block(): BelongsTo
    {
        return $this->belongsTo(ReportBlock::class, 'report_block_id');
    }
}
