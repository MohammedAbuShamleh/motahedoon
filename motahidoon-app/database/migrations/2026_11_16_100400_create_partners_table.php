<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('name');
            $table->foreignId('logo_media_id')->nullable()->constrained('media')->nullOnDelete();
            // الثلاثة بانتظار الاعتماد لكل الشركاء السبعة اليوم
            $table->string('site_url', 512)->nullable();
            $table->string('role', 512)->nullable();
            $table->text('about')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['is_published', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('partners');
    }
};
