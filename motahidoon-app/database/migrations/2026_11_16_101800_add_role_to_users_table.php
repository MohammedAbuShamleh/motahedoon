<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::table('users', function (Blueprint $table) {
            /* ثلاثة أدوار تكفي اليوم: مدير، محرّر، مترجم.
               لا نظام صلاحيات دقيق قبل أن توجد حاجة له. */
            $table->enum('role', ['admin', 'editor', 'translator'])
                  ->default('editor')->after('email');
            $table->index('role');
        });
    }

    public function down(): void
    {

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
        });
    }
};
