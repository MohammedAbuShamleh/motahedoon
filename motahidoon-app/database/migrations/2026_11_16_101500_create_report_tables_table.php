<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* جدول داخل تقرير: إمّا داخل قسم، وإمّا جدول الموجز على مستوى
           التقرير (report_section_id = null).

           head وrows وfoot تُخزَّن JSON عمداً — إلغاء تطبيع مقصود:
           الجدول يُحرَّر ويُعرض وحدةً واحدة، ولا يُستعلَم عن خليّة فيه
           أبداً. تطبيعه إلى صفوف وخلايا يضاعف الجداول بلا مكسب،
           ويُعقّد محرّر الشبكة في اللوحة. وJSON يحفظ النصّ حرفياً. */
        Schema::create('report_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->cascadeOnDelete();
            $table->foreignId('report_section_id')->nullable()
                  ->constrained('report_sections')->cascadeOnDelete();
            $table->string('title', 512)->nullable();
            $table->json('head');
            $table->json('rows');
            $table->json('foot')->nullable();
            $table->text('foot_note')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['report_id', 'position']);
            $table->index('report_section_id');
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_tables');
    }
};
