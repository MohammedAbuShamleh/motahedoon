<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * بطاقات الأرقام تُحرَّر من اللوحة بدل أن تُستخرج من النصّ وحده:
 * قائمة [{value, unit}] للقسم (بطاقات صفحة المجال وملخّص التقرير) ولكلّ
 * مجموعة (شريط الأرقام تحتها). null = استخراج تلقائي من البنود كما كان.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('report_sections', function (Blueprint $table): void {
            $table->json('stats')->nullable()->after('lead');
        });
        Schema::table('report_groups', function (Blueprint $table): void {
            $table->json('stats')->nullable()->after('is_recap');
        });
    }

    public function down(): void
    {
        Schema::table('report_groups', fn (Blueprint $table) => $table->dropColumn('stats'));
        Schema::table('report_sections', fn (Blueprint $table) => $table->dropColumn('stats'));
    }
};
