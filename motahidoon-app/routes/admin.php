<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

/*
| لوحة التحكم. الأدوار:
|   admin      كل شيء، ومنه المستخدمون واعتماد الترجمات
|   editor     المحتوى كلّه
|   translator الترجمات ونصوص الواجهة وحدها
*/
Route::middleware('guest')->group(function () {
    Route::get('admin/login', [LoginController::class, 'create'])->name('login');
    Route::post('admin/login', [LoginController::class, 'store'])->middleware('throttle:10,1');
});

Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    Route::post('logout', [LoginController::class, 'destroy'])->name('logout');
    Route::get('/', Admin\DashboardController::class)->name('dashboard');

    Route::middleware('role:admin,editor,translator')->group(function () {
        Route::get('translations', [Admin\TranslationController::class, 'index'])->name('translations.index');
        Route::put('translations/{translation}', [Admin\TranslationController::class, 'update'])->name('translations.update');
        Route::post('translations/approve', [Admin\TranslationController::class, 'approve'])
            ->middleware('role:admin')->name('translations.approve');
        Route::resource('ui-strings', Admin\UiStringController::class)
            ->only(['index', 'store', 'update', 'destroy'])->parameters(['ui-strings' => 'string']);
    });

    Route::middleware('role:admin,editor')->group(function () {
        Route::get('settings', [Admin\SiteSettingController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [Admin\SiteSettingController::class, 'update'])->name('settings.update');

        Route::resource('content-lines', Admin\ContentLineController::class)
            ->only(['index', 'store', 'update', 'destroy'])->parameters(['content-lines' => 'line']);
        Route::resource('partners', Admin\PartnerController::class)->except('show');
        Route::resource('pillars', Admin\PillarController::class)->except('show');

        Route::get('field-photos', [Admin\FieldPhotoController::class, 'index'])->name('field-photos.index');
        Route::post('field-photos', [Admin\FieldPhotoController::class, 'store'])->name('field-photos.store');
        Route::put('field-photos/order', [Admin\FieldPhotoController::class, 'reorder'])->name('field-photos.reorder');
        Route::delete('field-photos/{photo}', [Admin\FieldPhotoController::class, 'destroy'])->name('field-photos.destroy');

        Route::get('video-albums/guide', [Admin\VideoAlbumController::class, 'guide'])->name('video-albums.guide');
        Route::resource('video-albums', Admin\VideoAlbumController::class)->except('show')
            ->parameters(['video-albums' => 'album']);
        Route::get('video-albums/{album}/videos/create', [Admin\VideoController::class, 'create'])->name('videos.create');
        Route::post('video-albums/{album}/videos', [Admin\VideoController::class, 'store'])->name('videos.store');
        Route::get('videos/{video}/edit', [Admin\VideoController::class, 'edit'])->name('videos.edit');
        Route::put('videos/{video}', [Admin\VideoController::class, 'update'])->name('videos.update');
        Route::delete('videos/{video}', [Admin\VideoController::class, 'destroy'])->name('videos.destroy');

        Route::resource('media', Admin\MediaController::class)->only(['index', 'store', 'destroy'])
            ->parameters(['media' => 'media']);

        Route::resource('reports', Admin\ReportController::class)->except('show');
        Route::post('reports/{report}/sections', [Admin\ReportSectionController::class, 'store'])->name('sections.store');
        Route::get('sections/{section}/edit', [Admin\ReportSectionController::class, 'edit'])->name('sections.edit');
        Route::put('sections/{section}', [Admin\ReportSectionController::class, 'update'])->name('sections.update');
        Route::delete('sections/{section}', [Admin\ReportSectionController::class, 'destroy'])->name('sections.destroy');
    });

    Route::middleware('role:admin')->group(function () {
        Route::resource('users', Admin\UserController::class)->except('show');
    });
});
