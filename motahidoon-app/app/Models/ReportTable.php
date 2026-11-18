<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** جدول يُحرَّر ويُعرض وحدةً؛ لا يُستعلَم عن خليّة فيه، فصفوفه JSON. */
class ReportTable extends Model
{
    use FlushesContentCache, HasPosition;

    protected $fillable = ['report_id', 'report_section_id', 'title', 'head', 'rows', 'foot', 'foot_note', 'position'];

    protected function casts(): array
    {
        return ['head' => 'array', 'rows' => 'array', 'foot' => 'array', 'position' => 'integer'];
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
