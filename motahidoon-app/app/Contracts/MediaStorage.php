<?php

namespace App\Contracts;

use Illuminate\Http\UploadedFile;

/**
 * مكان حفظ الملفات المرفوعة.
 *
 * التحقيق الحالي: public/uploads مباشرة (PublicDirectoryStorage).
 * لو انتقل الموقع يوماً إلى تخزين خارجي، يُكتب تحقيق آخر ويُبدَّل
 * سطر الربط في AppServiceProvider وحده.
 */
interface MediaStorage
{
    /** يحفظ الملف ويعيد مساره النسبي إلى public/ (مثلاً uploads/2026/11/x.jpg). */
    public function put(UploadedFile $file): string;

    /** المسار المطلق على القرص لمسار نسبي. */
    public function absolute(string $path): string;

    public function delete(string $path): void;
}
