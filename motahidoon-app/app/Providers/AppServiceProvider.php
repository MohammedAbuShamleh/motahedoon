<?php

namespace App\Providers;

use App\Contracts\ContentSource;
use App\Contracts\ImageProcessor;
use App\Contracts\MediaStorage;
use App\Models\ContentLine;
use App\Models\Partner;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\ReportLine;
use App\Models\ReportMetric;
use App\Models\ReportSection;
use App\Models\SiteSetting;
use App\Models\UiString;
use App\Services\Content\ContentCache;
use App\Services\Content\EloquentContentSource;
use App\Services\Media\GdImageProcessor;
use App\Services\Media\PublicDirectoryStorage;
use App\Services\SiteContent;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        /* نقطة التبديل الوحيدة. المرحلة ب: المحتوى من MySQL.
           ملفات JSON لم تعد تُقرأ في التشغيل؛ يستوردها ContentSeeder مرّة،
           وتبقى مرجعاً يقارن به php artisan content:verify. */
        $this->app->singleton(ContentSource::class, EloquentContentSource::class);
        $this->app->singleton(ContentCache::class);
        $this->app->singleton(SiteContent::class);

        /* الرفع إلى public/uploads مباشرة — لا storage ولا storage:link،
           فالاستضافة المشتركة لا تحتاج رابطاً رمزياً. */
        $this->app->singleton(MediaStorage::class, fn () => new PublicDirectoryStorage(
            public_path(), 'uploads'
        ));
        $this->app->singleton(ImageProcessor::class, GdImageProcessor::class);
    }

    public function boot(): void
    {
        /* أسماء ثابتة في translations.translatable_type بدل أسماء الأصناف:
           إعادة تسمية صنف لاحقاً لا تُيتِّم الترجمات. */
        Relation::enforceMorphMap([
            'site_setting' => SiteSetting::class,
            'content_line' => ContentLine::class,
            'partner' => Partner::class,
            'pillar' => Pillar::class,
            'report' => Report::class,
            'report_line' => ReportLine::class,
            'report_metric' => ReportMetric::class,
            'report_section' => ReportSection::class,
            'ui_string' => UiString::class,
            'video_album' => \App\Models\VideoAlbum::class,
            'video' => \App\Models\Video::class,
            'user' => \App\Models\User::class,
        ]);

        // N+1 خطأ لا أسلوب: يُكشف محلياً فوراً
        Model::preventLazyLoading(! $this->app->isProduction());
    }
}
