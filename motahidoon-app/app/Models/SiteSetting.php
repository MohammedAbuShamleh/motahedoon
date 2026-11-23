<?php

namespace App\Models;

use App\Traits\FlushesContentCache;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** هوية التجمّع وإعدادات الموقع — صفّ واحد. */
class SiteSetting extends Model
{
    use FlushesContentCache, HasTranslations;

    /** مفاتيح الشبكات الاجتماعية بترتيبها المعروض. */
    public const SOCIAL = ['facebook', 'instagram', 'youtube', 'telegram', 'x'];

    protected $fillable = [
        'name', 'short_name', 'tagline', 'logo_full_media_id', 'logo_mark_media_id',
        'vision', 'mission', 'founding_year', 'media_office', 'governance',
        'contact_email', 'contact_phone', 'contact_address', 'social',
        'social_enabled', 'social_style', 'social_theme',
        'whatsapp_enabled', 'whatsapp_number', 'whatsapp_text',
        'donate_url', 'donate_qr_media_id', 'donate_label', 'home_metrics_count',
    ];

    protected function casts(): array
    {
        return [
            'social' => 'array', 'home_metrics_count' => 'integer',
            'social_enabled' => 'boolean', 'social_style' => \App\Enums\SocialIconStyle::class,
            'social_theme' => 'array',
            'whatsapp_enabled' => 'boolean', 'whatsapp_text' => 'array',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrFail();
    }

    public function logoFull(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_full_media_id');
    }

    public function logoMark(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_mark_media_id');
    }

    public function donateQr(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'donate_qr_media_id');
    }
}
