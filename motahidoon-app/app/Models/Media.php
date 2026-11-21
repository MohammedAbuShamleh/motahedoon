<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ملف في public/ مباشرة.
 *
 * path نسبيّ إلى public/ ويُكتب في المحتوى كما هو: «assets/img/…» للأصول
 * المنقولة من الموقع الثابت، و«uploads/…» لما يُرفع من اللوحة.
 */
class Media extends Model
{
    use FlushesContentCache;

    protected $table = 'media';

    protected $fillable = ['path', 'disk', 'mime', 'width', 'height', 'bytes', 'is_bw', 'uploaded_by'];

    protected function casts(): array
    {
        return ['is_bw' => 'boolean', 'width' => 'integer', 'height' => 'integer', 'bytes' => 'integer'];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function url(): string
    {
        return asset($this->path);
    }

    /** ما رُفع من اللوحة وحده يُحذف ملفّه؛ أصول الموقع الأصلية لا تُمسّ. */
    public function isUploaded(): bool
    {
        return str_starts_with($this->path, 'uploads/');
    }
}
