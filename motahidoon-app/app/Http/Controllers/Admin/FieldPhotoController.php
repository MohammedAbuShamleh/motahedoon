<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FieldPhotoStoreRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Resources\Admin\MediaResource;
use App\Models\FieldPhoto;
use App\Services\Admin\FieldPhotoService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class FieldPhotoController extends Controller
{
    public function index(FieldPhotoService $service): Response
    {
        $photos = $service->listing()
            ->map(fn (FieldPhoto $p) => ['id' => $p->id, 'media' => MediaResource::brief($p->media)]);

        return Inertia::render('Admin/FieldPhotos/Index', ['photos' => $photos]);
    }

    public function store(FieldPhotoStoreRequest $request, FieldPhotoService $service): RedirectResponse
    {
        $service->add($request->validated('photos'), $request->user());

        return back()->with('success', 'رُفعت الصور (حُوّلت إلى أبيض وأسود).');
    }

    public function reorder(ReorderRequest $request, FieldPhotoService $service): RedirectResponse
    {
        $service->reorder($request->validated('ids'));

        return back()->with('success', 'حُفظ الترتيب.');
    }

    public function destroy(FieldPhoto $photo, FieldPhotoService $service): RedirectResponse
    {
        $service->delete($photo);

        return back()->with('success', 'حُذفت الصورة.');
    }
}
