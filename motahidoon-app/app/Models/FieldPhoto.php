<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FieldPhoto extends Model
{
    use FlushesContentCache, HasPosition;

    protected $fillable = ['media_id', 'position'];

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
