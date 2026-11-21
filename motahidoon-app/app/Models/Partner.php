<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partner extends Model
{
    use FlushesContentCache, HasPosition, HasTranslations;

    protected $fillable = ['slug', 'name', 'logo_media_id', 'site_url', 'role', 'about', 'position', 'is_published'];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'position' => 'integer'];
    }

    public function logo(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_media_id');
    }
}
