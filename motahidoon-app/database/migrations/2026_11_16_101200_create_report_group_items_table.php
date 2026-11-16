<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* البند: نصّ وحده، أو نصّ معنون، أو فقرة خلاصة تُطوى.
           الأرقام داخل body تبقى كما كُتبت؛ شريط الأرقام في الواجهة
           يستخرج أول رقم بوحدته ولا يحسب شيئاً. */
        Schema::create('report_group_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_group_id')->constrained('report_groups')->cascadeOnDelete();
            $table->string('term', 512)->nullable();
            $table->text('body');
            $table->boolean('is_recap')->default(false);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['report_group_id', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_group_items');
    }
};
