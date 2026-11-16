<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        /* طبقة الترجمة.
           العربية **ليست** هنا: هي في الأعمدة الأساسية لكل جدول.
           وحصر locale في en وtr يجعل قاعدة «العربية هي الأصل ولا
           تُترجَم» قيداً في المخطط لا عرفاً يُنسى.

           status يحمل سير العمل الذي يحتاجه وسم «ترجمة غير معتمدة»:
           machine (مسوّدة آلية) ← pending (بانتظار المراجعة) ←
           approved. الوسم يختفي من الموقع حين تصير كل حقول اللغة
           approved، لا بتبديل يدوي. */
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('translatable_type', 191);
            $table->unsignedBigInteger('translatable_id');
            $table->string('field', 64);
            $table->enum('locale', ['en', 'tr']);
            $table->text('value');
            $table->enum('status', ['machine', 'pending', 'approved'])->default('machine');
            $table->foreignId('translated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(
                ['translatable_type', 'translatable_id', 'field', 'locale'],
                'translations_unique'
            );
            // طابور الاعتماد في اللوحة: استعلام واحد لا مسح للجدول
            $table->index(['locale', 'status']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('translations');
    }
};
