<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportGroupItem extends Model
{
    use FlushesContentCache, HasPosition;

    protected $fillable = ['report_group_id', 'term', 'body', 'is_recap', 'position'];

    protected function casts(): array
    {
        return ['is_recap' => 'boolean', 'position' => 'integer'];
    }

    protected function positionScope(): array
    {
        return ['report_group_id'];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(ReportGroup::class, 'report_group_id');
    }
}
