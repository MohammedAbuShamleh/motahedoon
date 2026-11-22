<?php

namespace App\Services\Media;

use App\Contracts\ImageProcessor;
use App\Contracts\MediaStorage;
use App\Models\FieldPhoto;
use App\Models\Media;
use App\Models\Partner;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\ReportGalleryItem;
use App\Models\SiteSetting;
use App\Models\Video;
use App\Models\VideoAlbum;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * رفع الملفات وحذفها. لا يعرف أين تُحفظ (MediaStorage) ولا كيف تُعالَج
 * (ImageProcessor) — يعرف القواعد فقط.
 */
final class MediaService
{
    public function __construct(
        private readonly MediaStorage $storage,
        private readonly ImageProcessor $images,
    ) {}

    /** مكتبة الملفات، الأحدث أوّلاً، صفحةً صفحة */
    public function paginate(int $perPage = 48): LengthAwarePaginator
    {
        return Media::query()->orderByDesc('id')->paginate($perPage);
    }

    /**
     * @param bool $bw الصور الميدانية تُحوَّل أبيض وأسود في الملف؛ الشعارات وملفات PDF لا
     *
     * الملف يُكتب قبل سجلّه، والقرص لا يدخل المعاملة. فإن فشل إدراج السجل،
     * أو تراجعت المعاملة المحيطة (فشل حفظ الشريك بعد رفع شعاره مثلاً)،
     * يُحذف الملف — فلا يبقى على القرص ملف لا سجلّ له.
     */
    public function upload(UploadedFile $file, bool $bw = false, ?int $userId = null): Media
    {
        $mime = $file->getMimeType();
        $path = $this->storage->put($file);
        DB::afterRollBack(fn () => $this->storage->delete($path));

        try {
            $absolute = $this->storage->absolute($path);
            $isImage = str_starts_with((string) $mime, 'image/');
            $converted = $bw && $isImage && $this->images->grayscale($absolute);
            $size = $isImage ? $this->images->dimensions($absolute) : null;

            return Media::query()->create([
                'path' => $path,
                'disk' => 'public',
                'mime' => $mime,
                'width' => $size['width'] ?? null,
                'height' => $size['height'] ?? null,
                'bytes' => filesize($absolute) ?: null,
                'is_bw' => $converted,
                'uploaded_by' => $userId,
            ]);
        } catch (Throwable $e) {
            $this->storage->delete($path);
            throw $e;
        }
    }

    /** يرفع إن وُجد ملف، وإلا يعيد المعرّف الحالي (أو null إن طُلب الإفراغ). */
    public function replace(?UploadedFile $file, ?int $currentId, bool $remove, bool $bw, ?int $userId): ?int
    {
        if ($file !== null) {
            return $this->upload($file, $bw, $userId)->id;
        }

        return $remove ? null : $currentId;
    }

    /**
     * الفحص وحذف السجل معاملة واحدة، والملف يُحذف بعد نجاحها كلّها (afterCommit
     * ينتظر المعاملة الخارجية إن وُجدت). كان الملف يسبق السجل: لو فشل حذف
     * السجل بعده لبقي سجلّ يشير إلى ملف مفقود.
     */
    public function delete(Media $media): void
    {
        DB::transaction(function () use ($media): void {
            if ($this->isReferenced($media)) {
                throw ValidationException::withMessages([
                    'media' => 'الملف مستعمل في المحتوى؛ أزِله من مكانه أولاً.',
                ]);
            }
            $path = $media->isUploaded() ? $media->path : null;
            $media->delete();
            if ($path !== null) {
                DB::afterCommit(fn () => $this->storage->delete($path));
            }
        });
    }

    public function isReferenced(Media $media): bool
    {
        $id = $media->id;

        return SiteSetting::query()->where(fn ($q) => $q->where('logo_full_media_id', $id)
            ->orWhere('logo_mark_media_id', $id)->orWhere('donate_qr_media_id', $id))->exists()
            || Partner::query()->where('logo_media_id', $id)->exists()
            || Pillar::query()->where('cover_media_id', $id)->exists()
            || FieldPhoto::query()->where('media_id', $id)->exists()
            || ReportGalleryItem::query()->where('media_id', $id)->exists()
            || Report::query()->where(fn ($q) => $q->where('report_file_media_id', $id)
                ->orWhere('appeal_photo_media_id', $id))->exists()
            || VideoAlbum::query()->where('cover_media_id', $id)->exists()
            || Video::query()->where(fn ($q) => $q->where('media_id', $id)->orWhere('poster_media_id', $id))->exists();
    }
}
