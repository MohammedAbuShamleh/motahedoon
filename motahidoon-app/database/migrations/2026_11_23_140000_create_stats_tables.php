<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * إحصاءات الزيارات: عدّادات يومية مجمّعة لا سجلّ زيارات.
 *
 * لا يُحفظ عنوان IP ولا متصفّح ولا ملفّ تعريف. الزائر الفريد يُعرَف ببصمة
 * يومية مقطوعة (IP + المتصفّح + اليوم + مفتاح التطبيق) في جدول مؤقّت يُفرَّغ
 * بعد يومين — تكفي لعدم عدّ الزائر نفسه مرّتين في اليوم، ولا تتبعه عبر الأيام.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stat_page_days', function (Blueprint $table) {
            $table->id();
            $table->date('day');
            $table->string('path', 191);
            $table->string('locale', 2);
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('visitors')->default(0);

            $table->unique(['day', 'path', 'locale']);
            $table->index('path');
        });

        Schema::create('stat_section_days', function (Blueprint $table) {
            $table->id();
            $table->date('day');
            $table->string('path', 191);
            $table->string('section', 64);
            $table->unsignedInteger('views')->default(0);

            $table->unique(['day', 'path', 'section']);
        });

        Schema::create('stat_visitor_hits', function (Blueprint $table) {
            $table->date('day');
            $table->char('visitor', 16);
            $table->string('path', 191);

            $table->primary(['day', 'visitor', 'path']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stat_visitor_hits');
        Schema::dropIfExists('stat_section_days');
        Schema::dropIfExists('stat_page_days');
    }
};
