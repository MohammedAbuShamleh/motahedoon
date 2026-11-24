<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RichMediaRequest;
use App\Services\Media\MediaService;
use Illuminate\Http\JsonResponse;

/**
 * رفع صورة من داخل المحرّر. JSON لا Inertia: المحرّر يُدرجها في مكان المؤشّر.
 * الصورة ميدانية فتُحفَظ أبيض وأسود في الملف نفسه (قرار هوية).
 * الرابط نسبيّ: المحتوى لا يُثبّت اسم خادم بعينه.
 */
final class RichMediaController extends Controller
{
    public function __invoke(RichMediaRequest $request, MediaService $media): JsonResponse
    {
        $file = $media->upload($request->file('file'), true, $request->user()->id);

        return response()->json(['url' => '/'.ltrim($file->path, '/')]);
    }
}
