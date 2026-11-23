<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** إظهار روابط التواصل في التذييل أو إخفاؤها كلّها، ونمط أيقوناتها. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->boolean('social_enabled')->default(true)->after('social');
            $table->string('social_style', 16)->default('outline')->after('social_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropColumn(['social_enabled', 'social_style']);
        });
    }
};
