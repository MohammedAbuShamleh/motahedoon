<?php

namespace App\Models;

use App\Enums\ReportLineGroup;
use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportLine extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    protected $fillable = ['report_id', 'group', 'term', 'body', 'is_recap', 'position'];

    protected function casts(): array
    {
        return ['group' => ReportLineGroup::class, 'is_recap' => 'boolean', 'position' => 'integer'];
    }

    protected function positionScope(): array
    {
        return ['report_id', 'group'];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
