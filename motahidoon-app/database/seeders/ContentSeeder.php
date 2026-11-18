<?php

namespace Database\Seeders;

use App\Services\Content\ContentImporter;
use App\Services\JsonContentSource;
use Illuminate\Database\Seeder;

/**
 * يستورد المحتوى الحالي من resources/content/*.json — نُسخت برمجياً
 * عن data.js الأصلي. بعد الاستيراد لا يقرأ الموقعُ هذه الملفات؛ تبقى
 * مرجعاً للمقارنة (php artisan content:verify).
 */
class ContentSeeder extends Seeder
{
    public function run(ContentImporter $importer): void
    {
        // لا استيراد فوق محتوى قائم: قد يكون محرَّراً من اللوحة
        if (\App\Models\SiteSetting::query()->exists()) {
            $this->command?->warn('المحتوى مستورَد سلفاً — تُرك كما هو. لإعادة الاستيراد: php artisan migrate:fresh --seed');

            return;
        }

        $importer->import(new JsonContentSource(resource_path('content')));
    }
}
