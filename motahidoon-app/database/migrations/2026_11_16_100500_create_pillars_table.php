<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* مجالات العمل — محتوى دائم لا يبلى بفترة.
           definition وcover قد يكونان null: خمسة مجالات بلا تعريف
           ومجال بلا غلاف اليوم، وكلاهما خانة محجوزة لا نقص يُخفى. */
        Schema::create('pillars', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('num', 8);
            $table->string('title', 512);
            $table->string('short', 255);
            $table->string('orgs', 512);
            $table->text('definition')->nullable();
            $table->foreignId('cover_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('cover_caption', 512)->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['is_published', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('pillars');
    }
};
