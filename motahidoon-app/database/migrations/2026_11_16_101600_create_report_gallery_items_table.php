<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* صور داخل قسم تقرير، لكل صورة تعليقها. التعليق هنا لا على
           media: الصورة قد تُستعمل مرّتين بتعليقين. */
        Schema::create('report_gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_section_id')->constrained('report_sections')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->string('caption', 512);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['report_section_id', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_gallery_items');
    }
};
