<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** مجال عمل. definition فارغ في خمسة من سبعة — يُرسَم خانةً محجوزة ولا يُملأ. */
class Pillar extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    protected $fillable = [
        'slug', 'num', 'title', 'short', 'orgs', 'definition',
        'cover_media_id', 'cover_caption', 'position', 'is_published',
    ];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'position' => 'integer'];
    }

    public function cover(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_media_id');
    }

    public function reportSections(): HasMany
    {
        return $this->hasMany(ReportSection::class);
    }
}
