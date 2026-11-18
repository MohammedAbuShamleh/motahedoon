<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportBlock extends Model
{
    use FlushesContentCache, HasPosition;

    protected $fillable = ['report_section_id', 'title', 'note_term', 'note_body', 'position'];

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }

    protected function positionScope(): array
    {
        return ['report_section_id'];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(ReportSection::class, 'report_section_id');
    }

    public function figures(): HasMany
    {
        return $this->hasMany(ReportBlockFigure::class)->ordered();
    }
}
