<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* مجموعة بنود داخل قسم. is_recap: مجموعة كلها خلاصة لا تُعرض
           إلا مطويّة. num وtitle اختياريان — بعض المجموعات بلا ترويسة. */
        Schema::create('report_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_section_id')->constrained('report_sections')->cascadeOnDelete();
            $table->string('num', 8)->nullable();
            $table->string('title', 512)->nullable();
            $table->boolean('is_recap')->default(false);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['report_section_id', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_groups');
    }
};
