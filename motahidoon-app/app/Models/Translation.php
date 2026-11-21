<?php

namespace App\Models;

use App\Enums\Locale;
use App\Enums\TranslationStatus;
use App\Traits\FlushesContentCache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * ترجمة حقل واحد بلغة واحدة. اللغة en|tr فقط — العربية لا تُقبل هنا
 * بقيد المخطط نفسه.
 */
class Translation extends Model
{
    use FlushesContentCache;

    protected $fillable = [
        'translatable_type', 'translatable_id', 'field', 'locale', 'value',
        'status', 'translated_by', 'reviewed_by', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'locale' => Locale::class,
            'status' => TranslationStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function translatable(): MorphTo
    {
        return $this->morphTo();
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
