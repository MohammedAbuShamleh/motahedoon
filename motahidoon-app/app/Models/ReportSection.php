<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** قسم التقرير الخاص بمجال واحد. */
class ReportSection extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    protected $fillable = ['report_id', 'pillar_id', 'lead', 'position'];

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }

    protected function positionScope(): array
    {
        return ['report_id'];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function pillar(): BelongsTo
    {
        return $this->belongsTo(Pillar::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(ReportGroup::class)->ordered();
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(ReportBlock::class)->ordered();
    }

    public function table(): HasOne
    {
        return $this->hasOne(ReportTable::class);
    }

    public function gallery(): HasMany
    {
        return $this->hasMany(ReportGalleryItem::class)->ordered();
    }
}
