<?php

use App\Contracts\ContentSource;
use App\Http\Controllers\Site\AboutController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Site\PillarController;
use App\Http\Controllers\Site\ReportController;
use App\Http\Controllers\Site\VideoController;
use Illuminate\Support\Facades\Route;

/*
| الواجهة العامة.
| مسارات حقيقية بدل pillar.html?id= — مكسب أرشفة بلا كلفة، إذ لا روابط
| منشورة بعد. و/reports بلا معرّف يقود إلى التقرير الحالي، كما كان
| ?id=report تماماً.
*/
Route::get('/', HomeController::class)->name('home');
Route::get('/about', AboutController::class)->name('about');
Route::get('/p/{slug}', PillarController::class)->name('pillar');
Route::get('/reports', ReportController::class)->name('reports');
Route::get('/reports/{slug}', ReportController::class)->name('report');
Route::get('/videos', [VideoController::class, 'index'])->name('videos');
Route::get('/videos/{slug}', [VideoController::class, 'album'])->name('videos.album');

/* مسار تطوير فقط: يخدم شجرة المحتوى العربية لمدقّق سلامة النصوص
   (tools/verify-strings.js). لا يُسجَّل خارج البيئة المحلية.
   المصدر الآن القاعدة لا الملف — فالمدقّق يفحص ما يُرسَم فعلاً. */
if (app()->environment('local')) {
    Route::get('/__content.json', fn (ContentSource $content) => response()->json(
        $content->base(), 200, [], JSON_UNESCAPED_UNICODE
    ))->name('dev.content');
}

require __DIR__.'/admin.php';
