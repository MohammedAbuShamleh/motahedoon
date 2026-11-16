<?php

namespace App\Providers;

use App\Contracts\ContentSource;
use App\Services\JsonContentSource;
use App\Services\SiteContent;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        /* المرحلة أ: المحتوى من JSON منقول حرفياً عن data.js.
           المرحلة ب تستبدل هذا السطر وحده بـEloquentContentSource. */
        $this->app->singleton(ContentSource::class, fn () => new JsonContentSource(
            resource_path('content')
        ));

        $this->app->singleton(SiteContent::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
