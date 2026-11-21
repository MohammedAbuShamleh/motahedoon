<?php

namespace App\Contracts;

/** معالجة الصورة عند الرفع — متزامنة، لا طابور (استضافة مشتركة). */
interface ImageProcessor
{
    /**
     * أبيض وأسود في الملف نفسه: قرار هوية، لا مرشّح CSS.
     * يعيد false إن تعذّرت المعالجة (صيغة غير مدعومة) فيبقى الملف كما هو.
     */
    public function grayscale(string $absolutePath): bool;

    /** @return array{width: int, height: int}|null */
    public function dimensions(string $absolutePath): ?array;
}
