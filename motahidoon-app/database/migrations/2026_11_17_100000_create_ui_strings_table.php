<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * نصوص الواجهة (تسميات الأزرار والعناوين الثابتة).
 *
 * المفتاح هو النصّ العربي نفسه — كما كانت خريطة ui في ملفات JSON —
 * وترجماته في جدول translations كأي حقل آخر (field = 'value')، فتمرّ
 * بطابور الاعتماد نفسه. لا عمود للإنجليزية ولا للتركية هنا عمداً:
 * القاعدة «العربية في الأعمدة الأساسية» تبقى قيداً في المخطط.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ui_strings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 255)->unique();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
            $table->index('position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ui_strings');
    }
};
