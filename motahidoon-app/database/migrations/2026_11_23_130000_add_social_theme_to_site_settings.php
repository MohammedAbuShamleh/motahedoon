<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ألوان أيقونات التواصل في التذييل وأثر المرور عليها — فوق النمط المختار.
 * JSON واحد: icon, border, hover_icon, hover_border, hover_bg (#RRGGBB أو null
 * = لون النمط نفسه)، وhover_effect (default | lift | grow | fill).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->json('social_theme')->nullable()->after('social_style');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropColumn('social_theme');
        });
    }
};
