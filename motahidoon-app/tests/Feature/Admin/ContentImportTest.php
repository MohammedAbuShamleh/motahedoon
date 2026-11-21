<?php

namespace Tests\Feature\Admin;

use App\Contracts\ContentSource;
use App\Services\Content\EloquentContentSource;

/** بوّابة الترحيل: الشجرة من القاعدة = ملفات JSON المصدر، حرفاً بحرف. */
final class ContentImportTest extends AdminTestCase
{
    public function test_database_tree_matches_json_source_for_every_locale(): void
    {
        $this->artisan('content:verify')->assertSuccessful();
    }

    public function test_site_is_served_from_the_database(): void
    {
        $this->assertInstanceOf(EloquentContentSource::class, app(ContentSource::class));

        foreach (['/', '/about', '/reports', '/reports/q2-2026', '/p/dawah'] as $url) {
            foreach (['ar', 'en', 'tr'] as $lang) {
                $this->get("{$url}?lang={$lang}")->assertOk();
            }
        }
    }

    public function test_seeder_does_not_import_twice(): void
    {
        $this->seed(\Database\Seeders\ContentSeeder::class);
        $this->assertSame(1, \App\Models\SiteSetting::query()->count());
        $this->assertSame(7, \App\Models\Partner::query()->count());
    }
}
