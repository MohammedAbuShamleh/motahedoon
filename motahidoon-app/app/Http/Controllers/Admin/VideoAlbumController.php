<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VideoAlbumRequest;
use App\Http\Resources\Admin\VideoAlbumResource;
use App\Models\Pillar;
use App\Models\VideoAlbum;
use App\Services\Admin\VideoAlbumService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class VideoAlbumController extends Controller
{
    public function index(VideoAlbumService $service): Response
    {
        return Inertia::render('Admin/VideoAlbums/Index', [
            'albums' => VideoAlbumResource::collection($service->listing())->resolve(),
        ]);
    }

    /** دليل المكتبة: خطوات إنشاء ألبوم وإضافة مقاطعه */
    public function guide(): Response
    {
        return Inertia::render('Admin/VideoAlbums/Guide', [
            'maxMb' => (int) floor((int) config('admin.video_max_kb') / 1024),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/VideoAlbums/Form', ['album' => null, 'pillars' => $this->pillars()]);
    }

    public function store(VideoAlbumRequest $request, VideoAlbumService $service): RedirectResponse
    {
        $album = $service->save(null, $request->validated(), $request->user());

        return to_route('admin.video-albums.edit', $album)->with('success', 'تمت إضافة الألبوم. أضف مقاطعه الآن.');
    }

    public function edit(VideoAlbum $album, VideoAlbumService $service): Response
    {
        return Inertia::render('Admin/VideoAlbums/Form', [
            'album' => VideoAlbumResource::make($service->forEdit($album))->resolve(),
            'pillars' => $this->pillars(),
        ]);
    }

    public function update(VideoAlbumRequest $request, VideoAlbum $album, VideoAlbumService $service): RedirectResponse
    {
        $service->save($album, $request->validated(), $request->user());

        return back()->with('success', 'تم حفظ الألبوم.');
    }

    public function destroy(VideoAlbum $album, VideoAlbumService $service): RedirectResponse
    {
        $service->delete($album);

        return to_route('admin.video-albums.index')->with('success', 'تم حذف الألبوم ومقاطعه.');
    }

    /** @return list<array{id: int, title: string}> لربط الألبوم بمجال عمل */
    private function pillars(): array
    {
        return Pillar::query()->ordered()->get(['id', 'title'])
            ->map(fn (Pillar $p) => ['id' => $p->id, 'title' => $p->title])->all();
    }
}
