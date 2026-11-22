<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** ألبوم في مكتبة الفيديو. الحقول المترجمة: title, description. */
class VideoAlbum extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    protected $fillable = ['slug', 'title', 'description', 'cover_media_id', 'pillar_id', 'is_published', 'position'];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'position' => 'integer'];
    }

    public function cover(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_media_id');
    }

    public function pillar(): BelongsTo
    {
        return $this->belongsTo(Pillar::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(Video::class)->ordered();
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
