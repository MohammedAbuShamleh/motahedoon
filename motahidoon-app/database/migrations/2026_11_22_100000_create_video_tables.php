<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /* مكتبة الفيديو: ألبومات، في كلّ ألبوم مقاطع. العربية في الأعمدة،
           والإنجليزية والتركية في translations (title, description). */
        Schema::create('video_albums', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('title');
            $table->text('description')->nullable();
            // غلاف اختياري؛ بدونه يُستعار غلاف أوّل مقطع
            $table->foreignId('cover_media_id')->nullable()->constrained('media')->nullOnDelete();
            // ربط اختياري بمجال عمل — للتصنيف لا للعرض الإجباري
            $table->foreignId('pillar_id')->nullable()->constrained('pillars')->nullOnDelete();
            $table->boolean('is_published')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index('position');
        });

        /* المقطع رابطٌ (يوتيوب أو فيسبوك) أو ملفٌّ مرفوع — لا الاثنان.
           المدّة نصّ كما يُكتب («4:12»)، لا رقمٌ يُشتقّ منه. */
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_album_id')->constrained('video_albums')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('source', 8);                    // url | file
            $table->string('url', 512)->nullable();         // للمصدر url
            $table->foreignId('media_id')->nullable()->constrained('media')->nullOnDelete();         // للمصدر file
            $table->foreignId('poster_media_id')->nullable()->constrained('media')->nullOnDelete();  // صورة الغلاف
            $table->string('duration', 16)->nullable();
            $table->date('recorded_on')->nullable();
            $table->boolean('is_featured')->default(false); // يتقدّم في قسم الرئيسية
            $table->boolean('is_published')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['video_album_id', 'position']);
            $table->index(['is_published', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
        Schema::dropIfExists('video_albums');
    }
};
