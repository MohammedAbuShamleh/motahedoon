<?php

namespace App\Contracts;

/**
 * مصدر المحتوى.
 *
 * المرحلة أ تحقّقه بملفات JSON منقولة حرفياً عن data.js.
 * المرحلة ب تستبدلها بـMySQL، وما فوق هذا العقد لا يتغيّر سطر واحد.
 */
interface ContentSource
{
    /** الشجرة العربية كاملة — مصدر السجل، لا تُترجَم. */
    public function base(): array;

    /** طبقة الترجمة للّغة، أو null إن لم توجد. مفاتيحها نصوص عربية. */
    public function overlay(string $locale): ?array;
}
