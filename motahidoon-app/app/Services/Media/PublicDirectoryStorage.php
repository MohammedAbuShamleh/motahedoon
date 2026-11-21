<?php

namespace App\Services\Media;

use App\Contracts\MediaStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * يحفظ في public/<dir>/YYYY/MM/ باسم عشوائي.
 *
 * الاسم عشوائي لا اسم الملف الأصلي: يمنع التصادم، ويمنع تمرير مسار
 * (../) عبر اسم الملف، ولا يكشف أسماء ملفات الجهاز الرافع.
 */
final class PublicDirectoryStorage implements MediaStorage
{
    public function __construct(
        private readonly string $publicRoot,
        private readonly string $dir,
    ) {}

    public function put(UploadedFile $file): string
    {
        $folder = $this->dir.'/'.now()->format('Y/m');
        $name = Str::uuid()->toString().'.'.strtolower($file->guessExtension() ?: $file->getClientOriginalExtension());

        $file->move($this->absolute($folder), $name);

        return "{$folder}/{$name}";
    }

    public function absolute(string $path): string
    {
        return $this->publicRoot.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $path);
    }

    public function delete(string $path): void
    {
        // لا يُحذف شيء خارج مجلد الرفع — أصول الموقع الأصلية محميّة
        if (! str_starts_with($path, $this->dir.'/') || str_contains($path, '..')) {
            throw new InvalidArgumentException("مسار خارج مجلد الرفع: {$path}");
        }
        $file = $this->absolute($path);
        if (is_file($file)) {
            unlink($file);
        }
    }
}
