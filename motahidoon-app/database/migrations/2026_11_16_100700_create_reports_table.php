<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* التقرير الدوري — وحدة الأرشيف. العناوين المفردة أعمدة،
           والقوائم في report_lines، والجداول في report_tables. */
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('label', 120);                 // الربع الثالث 2026
            $table->string('range', 255);
            $table->string('report_title', 512);
            $table->foreignId('report_file_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('metrics_title', 512);

            // عناوين القوائم المعنونة؛ بنودها في report_lines
            $table->string('reading_title', 512)->nullable();
            $table->string('data_notes_title', 512)->nullable();
            $table->string('opportunities_title', 512)->nullable();

            $table->string('closing_title', 512)->nullable();
            $table->string('closing_signoff', 512)->nullable();

            // نداء الدعم: عنوانه وافتتاحيته وصورته؛ بنوده في report_lines
            $table->string('appeal_title', 512)->nullable();
            $table->text('appeal_lead')->nullable();
            $table->foreignId('appeal_photo_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('appeal_photo_caption', 512)->nullable();

            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            /* التقرير الحالي واحد. يُفرَض في الخدمة داخل معاملة لا في
               المخطط، لأن قيد «صفّ واحد فقط بقيمة true» لا يُعبَّر عنه
               في MySQL إلا بحيلة. الفهرس هنا للقراءة لا للقيد. */
            $table->boolean('is_current')->default(false);
            $table->timestamps();

            $table->index(['status', 'published_at']);
            $table->index('is_current');
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('reports');
    }
};
