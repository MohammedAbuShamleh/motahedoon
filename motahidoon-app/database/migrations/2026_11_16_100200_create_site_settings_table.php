<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* صفّ واحد. الهوية الدائمة وما يتبعها من تواصل ودعم. */
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_name', 120);
            $table->string('tagline', 512);
            $table->foreignId('logo_full_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('logo_mark_media_id')->nullable()->constrained('media')->nullOnDelete();

            $table->text('vision');
            $table->text('mission');
            $table->string('founding_year', 16)->nullable();
            $table->string('media_office');

            // حقول بانتظار اعتماد التجمع: تبقى null ويرسمها الموقع
            // خانات محجوزة موسومة، ولا يُخترع لها بديل.
            $table->text('governance')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone', 64)->nullable();
            $table->string('contact_address', 512)->nullable();
            $table->json('social')->nullable();

            $table->string('donate_url', 512)->nullable();
            $table->foreignId('donate_qr_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('donate_label');

            // كم مؤشّراً من التقرير الحالي يظهر في «لمحة أثر»
            $table->unsignedTinyInteger('home_metrics_count')->default(3);

            $table->timestamps();
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('site_settings');
    }
};
