<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* جدول واحد لخمس قوائم مرتَّبة متطابقة البنية: القيم، قصة
           التأسيس، الأهداف، التطلعات، فقرات التمهيد. خمس تكرارات
           تُبرّر التجريد؛ وتُكسب اللوحةَ محرّرَ قائمة واحداً يُعاد استعماله.
           term اختياري: بعض القيم معنونة وبعض الأهداف نصّ وحده. */
        Schema::create('content_lines', function (Blueprint $table) {
            $table->id();
            $table->enum('group', ['value', 'story', 'goal', 'aspiration', 'intro']);
            $table->string('term', 512)->nullable();
            $table->text('body');
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['group', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('content_lines');
    }
};
