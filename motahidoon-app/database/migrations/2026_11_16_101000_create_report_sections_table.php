<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* حصيلة مجال واحد داخل فترة واحدة.
           المجالات لا تظهر كلها في كل فترة — الربع الثالث فيه سبعة
           والثاني ستة — فالعلاقة اختيارية لا إلزامية. */
        Schema::create('report_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->cascadeOnDelete();
            $table->foreignId('pillar_id')->constrained('pillars')->cascadeOnDelete();
            $table->text('lead')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['report_id', 'pillar_id']);
            $table->index(['report_id', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_sections');
    }
};
