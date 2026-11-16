<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* شريط «من الميدان»: صور معتمدة بلا تعليقات — لا يُخترع وصف
           لصورة ولا يُذكر موقع ولا حي. الترتيب وحده ما يُحرَّر. */
        Schema::create('field_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->unique('media_id');
            $table->index('position');
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('field_photos');
    }
};
