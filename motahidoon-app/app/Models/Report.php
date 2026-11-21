<?php

namespace App\Models;

use App\Enums\ReportLineGroup;
use App\Enums\ReportStatus;
use App\Traits\FlushesContentCache;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

/** تقرير ربعي — محتوى «الحاشية» الموسوم بفترته. */
class Report extends Model
{
    use FlushesContentCache, HasTranslations;

    protected $fillable = [
        'slug', 'label', 'range', 'report_title', 'report_file_media_id', 'metrics_title',
        'reading_title', 'data_notes_title', 'opportunities_title', 'closing_title', 'closing_signoff',
        'appeal_title', 'appeal_lead', 'appeal_photo_media_id', 'appeal_photo_caption',
        'status', 'published_at', 'is_current',
    ];

    protected function casts(): array
    {
        return [
            'status' => ReportStatus::class,
            'published_at' => 'datetime',
            'is_current' => 'boolean',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ReportStatus::Published);
    }

    /** الأحدث أولاً؛ id يكسر التعادل فيبقى الترتيب ثابتاً. */
    public function scopeLatestFirst(Builder $query): Builder
    {
        return $query->orderByDesc('published_at')->orderByDesc('id');
    }

    public function reportFile(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'report_file_media_id');
    }

    public function appealPhoto(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'appeal_photo_media_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(ReportLine::class)->ordered();
    }

    /** @return Collection<int, ReportLine> */
    public function linesOf(ReportLineGroup $group): Collection
    {
        return $this->lines->where('group', $group)->values();
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(ReportMetric::class)->ordered();
    }

    public function sections(): HasMany
    {
        return $this->hasMany(ReportSection::class)->ordered();
    }

    /** الجداول كلّها؛ جدول الملخّص هو الذي لا يتبع قسماً. */
    public function tables(): HasMany
    {
        return $this->hasMany(ReportTable::class)->ordered();
    }

    public function summaryTable(): ?ReportTable
    {
        return $this->tables->first(fn (ReportTable $t) => $t->report_section_id === null);
    }
}
