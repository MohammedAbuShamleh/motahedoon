<?php

namespace App\Services\Content;

use App\Models\Media;

/**
 * يسجّل ملفاً موجوداً في public/ كسجلّ Media (أو يعيد سجلّه إن وُجد).
 * يستعمله المستورِد لأصول الموقع الأصلية التي لا تُرفع بل تُسجَّل.
 */
final class MediaRegistry
{
    /** @param bool $bw الصور الميدانية أبيض وأسود في الملف نفسه؛ الشعارات لا */
    public function register(?string $path, bool $bw = true): ?Media
    {
        if ($path === null) {
            return null;
        }

        return Media::query()->firstOrCreate(['path' => $path], $this->describe($path, $bw));
    }

    /** @return array<string, mixed> */
    private function describe(string $path, bool $bw): array
    {
        $file = public_path($path);
        $size = is_file($file) ? @getimagesize($file) : false;

        return [
            'disk' => 'public',
            'mime' => $size['mime'] ?? (is_file($file) ? mime_content_type($file) : null),
            'width' => $size[0] ?? null,
            'height' => $size[1] ?? null,
            'bytes' => is_file($file) ? filesize($file) : null,
            'is_bw' => $bw,
        ];
    }
}
