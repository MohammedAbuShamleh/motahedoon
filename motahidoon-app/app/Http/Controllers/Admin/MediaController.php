<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaStoreRequest;
use App\Http\Resources\Admin\MediaResource;
use App\Models\Media;
use App\Services\Media\MediaService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class MediaController extends Controller
{
    public function index(MediaService $service): Response
    {
        return Inertia::render('Admin/Media/Index', ['media' => MediaResource::collection($service->paginate())->response()->getData(true)]);
    }

    public function store(MediaStoreRequest $request, MediaService $service): RedirectResponse
    {
        foreach ($request->validated('files') as $file) {
            $service->upload($file, $request->boolean('bw'), $request->user()->id);
        }

        return back()->with('success', 'تم رفع الملفات.');
    }

    public function destroy(Media $media, MediaService $service): RedirectResponse
    {
        $service->delete($media);

        return back()->with('success', 'تم حذف الملف.');
    }
}
