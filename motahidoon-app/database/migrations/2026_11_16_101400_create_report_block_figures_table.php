<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* نفس بنية report_metrics، ومع ذلك جدول مستقلّ لا علاقة
           متعدّدة الأشكال: المفتاح الأجنبي هنا حقيقي ومقيَّد، وعلاقة
           polymorphic تُسقط هذا القيد. استعمالان لا يبرّران التجريد
           (قاعدة الثلاث)، وتكرار ستة أعمدة أرخص من تجريد خاطئ.
           value نصّ، للسبب نفسه الموثَّق في report_metrics. */
        Schema::create('report_block_figures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_block_id')->constrained('report_blocks')->cascadeOnDelete();
            $table->string('value', 64);
            $table->string('prefix', 32)->nullable();
            $table->string('unit', 64)->nullable();
            $table->string('label', 512);
            $table->boolean('accent')->default(false);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['report_block_id', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_block_figures');
    }
};
