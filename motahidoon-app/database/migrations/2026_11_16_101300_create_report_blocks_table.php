<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* كتلة أرقام معنونة داخل قسم، مع ملاحظة اختيارية أسفلها. */
        Schema::create('report_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_section_id')->constrained('report_sections')->cascadeOnDelete();
            $table->string('title', 512);
            $table->string('note_term', 512)->nullable();
            $table->text('note_body')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['report_section_id', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_blocks');
    }
};
