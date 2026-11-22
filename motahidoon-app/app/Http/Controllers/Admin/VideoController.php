<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VideoRequest;
use App\Http\Resources\Admin\VideoResource;
use App\Models\Video;
use App\Models\VideoAlbum;
use App\Services\Admin\VideoService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/** مقاطع ألبوم: الإنشاء تحت الألبوم، والتحرير والحذف بمعرّف المقطع وحده. */
final class VideoController extends Controller
{
    public function create(VideoAlbum $album): Response
    {
        return Inertia::render('Admin/Videos/Form', $this->props($album, null));
    }

    public function store(VideoRequest $request, VideoAlbum $album, VideoService $service): RedirectResponse
    {
        $service->save($album, null, $request->validated(), $request->user());

        return to_route('admin.video-albums.edit', $album)->with('success', 'تمت إضافة المقطع.');
    }

    public function edit(Video $video, VideoService $service): Response
    {
        $service->forEdit($video);

        return Inertia::render('Admin/Videos/Form', $this->props($video->album, $video));
    }

    public function update(VideoRequest $request, Video $video, VideoService $service): RedirectResponse
    {
        $video->loadMissing('album');
        $service->save($video->album, $video, $request->validated(), $request->user());

        return to_route('admin.video-albums.edit', $video->album)->with('success', 'تم حفظ المقطع.');
    }

    public function destroy(Video $video, VideoService $service): RedirectResponse
    {
        $album = $video->video_album_id;
        $service->delete($video);

        return to_route('admin.video-albums.edit', $album)->with('success', 'تم حذف المقطع.');
    }

    /** @return array<string, mixed> */
    private function props(VideoAlbum $album, ?Video $video): array
    {
        return [
            'album' => ['id' => $album->id, 'title' => $album->title],
            'video' => $video === null ? null : VideoResource::make($video)->resolve(),
            'maxMb' => (int) floor((int) config('admin.video_max_kb') / 1024),
        ];
    }
}
