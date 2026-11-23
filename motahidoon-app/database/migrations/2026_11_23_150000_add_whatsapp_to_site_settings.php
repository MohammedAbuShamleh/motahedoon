<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * زرّ واتساب العائم يُدار من اللوحة (روابط التواصل): إظهاره، ورقمه، ونصّه
 * الجاهز بكلّ لغة. الفارغ يسقط إلى config/site.php — فلا يتغيّر شيء حتى يُحفظ.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->boolean('whatsapp_enabled')->default(true)->after('social_theme');
            $table->string('whatsapp_number', 32)->nullable()->after('whatsapp_enabled');
            $table->json('whatsapp_text')->nullable()->after('whatsapp_number');   // {ar, en, tr}
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropColumn(['whatsapp_enabled', 'whatsapp_number', 'whatsapp_text']);
        });
    }
};
