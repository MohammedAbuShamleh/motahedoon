<?php

namespace App\Models;

use App\Support\VideoSource;
use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * مقطع فيديو: رابط (source = url) أو ملف مرفوع (source = file).
 * الحقول المترجمة: title, description.
 */
class Video extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    public const SOURCE_URL = 'url';
    public const SOURCE_FILE = 'file';

    protected $fillable = [
        'video_album_id', 'title', 'description', 'source', 'url', 'media_id', 'poster_media_id',
        'duration', 'recorded_on', 'is_featured', 'is_published', 'position',
    ];

    protected function casts(): array
    {
        return [
            'recorded_on' => 'date',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'position' => 'integer',
        ];
    }

    /** الترتيب داخل الألبوم وحده */
    protected function positionScope(): array
    {
        return ['video_album_id'];
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(VideoAlbum::class, 'video_album_id');
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'poster_media_id');
    }

    /** الرابط محلَّلاً (المزوّد والمعرّف ورابط التضمين)، أو null للملف المرفوع */
    public function linked(): ?VideoSource
    {
        return $this->source === self::SOURCE_URL && $this->url ? VideoSource::parse($this->url) : null;
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
