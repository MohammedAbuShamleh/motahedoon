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
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

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

    /** @param bool $bw الصور الميدانية تُحوَّل أبيض وأسود في الملف؛ الشعارات وملفات PDF لا */
    public function upload(UploadedFile $file, bool $bw = false, ?int $userId = null): Media
    {
        $mime = $file->getMimeType();
        $path = $this->storage->put($file);
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
    }

    /** يرفع إن وُجد ملف، وإلا يعيد المعرّف الحالي (أو null إن طُلب الإفراغ). */
    public function replace(?UploadedFile $file, ?int $currentId, bool $remove, bool $bw, ?int $userId): ?int
    {
        if ($file !== null) {
            return $this->upload($file, $bw, $userId)->id;
        }

        return $remove ? null : $currentId;
    }

    public function delete(Media $media): void
    {
        if ($this->isReferenced($media)) {
            throw ValidationException::withMessages([
                'media' => 'الملف مستعمل في المحتوى؛ أزِله من مكانه أولاً.',
            ]);
        }
        if ($media->isUploaded()) {
            $this->storage->delete($media->path);
        }
        $media->delete();
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
                ->orWhere('appeal_photo_media_id', $id))->exists();
    }
}
