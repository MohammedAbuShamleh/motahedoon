<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportGalleryItem extends Model
{
    use FlushesContentCache, HasPosition;

    protected $fillable = ['report_section_id', 'media_id', 'caption', 'position'];

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }

    protected function positionScope(): array
    {
        return ['report_section_id'];
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
