<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* القرار الحرج: value نصّ لا عدد.
           الرقم المنشور يُخزَّن كما كُتب حرفاً بحرف. ليس رقماً يُحسَب بل
           رقماً يُستنسخ. القاعدة الملزمة «لا أرقام مشتقّة»: لا جمع ولا
           نِسَب ولا تقريب ولا اختصار. تخزينه DECIMAL يفتح باب إعادة
           التنسيق، فمُنع من المخطط نفسه.
           انحراف مقصود عن قاعدة «المال DECIMAL» في معايير المشروع. */
        Schema::create('report_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->cascadeOnDelete();
            $table->string('value', 64);
            $table->string('prefix', 32)->nullable();
            $table->string('unit', 64)->nullable();
            $table->string('label', 512);
            $table->boolean('accent')->default(false);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['report_id', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_metrics');
    }
};
