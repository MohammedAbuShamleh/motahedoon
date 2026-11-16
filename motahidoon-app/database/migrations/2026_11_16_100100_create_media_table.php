<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* مكتبة الأصول. التعليق لا يُخزَّن هنا بل على السطر الذي يستعملها:
           الصورة الواحدة قد تُستعمل في موضعين بتعليقين مختلفين. */
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('path', 512);
            $table->string('disk', 32)->default('public');
            $table->string('mime', 128)->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('bytes')->nullable();
            // أبيض وأسود قرار هوية مطبَّق في الملف نفسه لا بمرشّح CSS
            $table->boolean('is_bw')->default(true);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique('path');
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('media');
    }
};
