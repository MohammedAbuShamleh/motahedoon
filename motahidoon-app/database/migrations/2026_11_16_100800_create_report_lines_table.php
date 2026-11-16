<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* كل قوائم التقرير النصّية في جدول واحد. ثمانية استعمالات
           متطابقة البنية: تنبيه، تمهيد، أبرز، قراءات، ملاحظات بيانات،
           فرص، فقرات الخاتمة، بنود النداء.
           term اختياري: بعض البنود معنونة وبعضها نصّ وحده.
           is_recap: فقرة خلاصة تُطوى في العرض ولا تُحذف. */
        Schema::create('report_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->cascadeOnDelete();
            $table->enum('group', [
                'notice', 'intro', 'highlight',
                'reading', 'data_note', 'opportunity',
                'closing_paragraph', 'appeal_item',
            ]);
            $table->string('term', 512)->nullable();
            $table->text('body');
            $table->boolean('is_recap')->default(false);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['report_id', 'group', 'position']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('report_lines');
    }
};
