<?php

namespace App\Services\Media;

use App\Contracts\ImageProcessor;
use GdImage;

/** تحقيق ImageProcessor بامتداد GD المضمّن في PHP — بلا تبعية جديدة. */
final class GdImageProcessor implements ImageProcessor
{
    public function grayscale(string $absolutePath): bool
    {
        $info = @getimagesize($absolutePath);
        if ($info === false) {
            return false;
        }

        $image = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($absolutePath),
            IMAGETYPE_PNG => @imagecreatefrompng($absolutePath),
            IMAGETYPE_WEBP => @imagecreatefromwebp($absolutePath),
            default => false,
        };
        if (! $image instanceof GdImage) {
            return false;
        }

        imagefilter($image, IMG_FILTER_GRAYSCALE);

        $ok = match ($info[2]) {
            IMAGETYPE_JPEG => imagejpeg($image, $absolutePath, 86),
            IMAGETYPE_PNG => $this->savePng($image, $absolutePath),
            IMAGETYPE_WEBP => imagewebp($image, $absolutePath, 86),
        };
        imagedestroy($image);

        return $ok;
    }

    public function dimensions(string $absolutePath): ?array
    {
        $info = @getimagesize($absolutePath);

        return $info === false ? null : ['width' => $info[0], 'height' => $info[1]];
    }

    private function savePng(GdImage $image, string $path): bool
    {
        imagesavealpha($image, true);

        return imagepng($image, $path, 6);
    }
}
