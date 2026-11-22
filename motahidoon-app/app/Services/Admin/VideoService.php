<?php

namespace App\Services\Admin;

use App\Models\Media;
use App\Models\User;
use App\Models\Video;
use App\Models\VideoAlbum;
use App\Services\Media\MediaService;
use Illuminate\Support\Facades\DB;

final class VideoService
{
    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
    ) {}

    /** المقطع جاهزاً لنموذج التحرير: الملفّان والترجمات والألبوم محمَّلة */
    public function forEdit(Video $video): Video
    {
        return $video->load(['album', 'file', 'poster', 'translations']);
    }

    /** @param array<string, mixed> $data */
    public function save(VideoAlbum $album, ?Video $video, array $data, User $by): Video
    {
        return DB::transaction(function () use ($album, $video, $data, $by): Video {
            $video ??= new Video(['video_album_id' => $album->id]);
            $oldFile = $video->media_id;
            $oldPoster = $video->poster_media_id;
            $isFile = $data['source'] === Video::SOURCE_FILE;

            $video->fill([
                ...collect($data)->only(['title', 'description', 'source', 'duration', 'recorded_on', 'is_featured', 'is_published'])->all(),
                'url' => $isFile ? null : $data['url'],
                // ملف الفيديو لا يُحوَّل ولا يُعالَج — يُحفظ كما رُفع
                'media_id' => $isFile
                    ? ($data['file'] ?? null ? $this->media->upload($data['file'], false, $by->id)->id : $video->media_id)
                    : null,
                'poster_media_id' => $this->media->replace(
                    $data['poster'] ?? null, $video->poster_media_id, (bool) ($data['remove_poster'] ?? false), false, $by->id
                ),
                'position' => $data['position'] ?? $video->position,
            ])->save();
            $this->translations->syncFields($video, $data['translations'] ?? null, ['title', 'description'], $by);

            // ملف مستبدَل أو متروك: يُحذف إن لم يعد يستعمله شيء — ملفات الفيديو ثقيلة
            $this->prune($oldFile !== $video->media_id ? $oldFile : null);
            $this->prune($oldPoster !== $video->poster_media_id ? $oldPoster : null);

            return $video;
        });
    }

    public function delete(Video $video): void
    {
        DB::transaction(function () use ($video): void {
            $file = $video->media_id;
            $poster = $video->poster_media_id;
            $video->delete();                   // ترجماته في حدث deleting
            $this->prune($file);
            $this->prune($poster);
        });
    }

    private function prune(?int $mediaId): void
    {
        $media = $mediaId === null ? null : Media::query()->find($mediaId);
        if ($media !== null && ! $this->media->isReferenced($media)) {
            $this->media->delete($media);
        }
    }
}
