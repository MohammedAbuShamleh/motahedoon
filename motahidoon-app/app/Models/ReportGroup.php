<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportGroup extends Model
{
    use FlushesContentCache, HasPosition;

    protected $fillable = ['report_section_id', 'num', 'title', 'is_recap', 'stats', 'position'];

    protected function casts(): array
    {
        return ['is_recap' => 'boolean', 'position' => 'integer', 'stats' => 'array'];
    }

    protected function positionScope(): array
    {
        return ['report_section_id'];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(ReportSection::class, 'report_section_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReportGroupItem::class)->ordered();
    }
}
