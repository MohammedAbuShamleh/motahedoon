<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * روابط التواصل الاجتماعي قائمةً مفتوحة تُدار من اللوحة وتُعرض في التذييل.
 *
 * كانت خمسة حقول ثابتة في site_settings.social؛ القيم المحفوظة فيها تُنقل
 * إلى هنا بترتيبها، ويبقى العمود القديم كما هو (لا حذف بيانات في ترحيل).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_links', function (Blueprint $table): void {
            $table->id();
            $table->string('platform', 32)->index();
            $table->string('url', 512);
            $table->string('label', 120)->nullable();   // لمنصّة «أخرى»: الاسم الظاهر
            $table->unsignedSmallInteger('position')->default(0)->index();
            $table->boolean('is_published')->default(true)->index();
            $table->timestamps();
        });

        $row = DB::table('site_settings')->first();
        $old = $row && is_string($row->social ?? null) ? json_decode($row->social, true) : null;
        if (! is_array($old)) {
            return;
        }

        $position = 0;
        foreach (['facebook', 'instagram', 'youtube', 'telegram', 'x'] as $platform) {
            $url = $old[$platform] ?? null;
            if (! is_string($url) || $url === '') {
                continue;
            }
            DB::table('social_links')->insert([
                'platform' => $platform, 'url' => $url, 'position' => ++$position,
                'is_published' => true, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('social_links');
    }
};
