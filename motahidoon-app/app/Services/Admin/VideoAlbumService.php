<?php

namespace App\Services\Admin;

use App\Models\Media;
use App\Models\User;
use App\Models\VideoAlbum;
use App\Services\Media\MediaService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class VideoAlbumService
{
    public function __construct(
        private readonly MediaService $media,
        private readonly TranslationService $translations,
        private readonly VideoService $videos,
    ) {}

    /** @return Collection<int, VideoAlbum> قائمة اللوحة بترتيب العرض، مع الغلاف وعدد المقاطع */
    public function listing(): Collection
    {
        return VideoAlbum::query()->ordered()->with('cover')->withCount('videos')->get();
    }

    /** الألبوم جاهزاً للتحرير: الغلاف والترجمات ومقاطعه بأغلفتها */
    public function forEdit(VideoAlbum $album): VideoAlbum
    {
        return $album->load(['cover', 'translations', 'videos.poster']);
    }

    /** @param array<string, mixed> $data */
    public function save(?VideoAlbum $album, array $data, User $by): VideoAlbum
    {
        return DB::transaction(function () use ($album, $data, $by): VideoAlbum {
            $album ??= new VideoAlbum;
            $album->fill([
                ...collect($data)->only(['slug', 'title', 'description', 'pillar_id', 'is_published'])->all(),
                'position' => $data['position'] ?? $album->position,
                'cover_media_id' => $this->media->replace(
                    $data['cover'] ?? null, $album->cover_media_id, (bool) ($data['remove_cover'] ?? false), false, $by->id
                ),
            ])->save();
            $this->translations->syncFields($album, $data['translations'] ?? null, ['title', 'description'], $by);

            return $album;
        });
    }

    /**
     * المقاطع تُحذف واحداً واحداً عبر خدمتها لا بسلسلة المفتاح الأجنبي —
     * السلسلة لا تُطلق أحداث النموذج، فتبقى ترجماتها وملفّاتها يتيمة.
     */
    public function delete(VideoAlbum $album): void
    {
        DB::transaction(function () use ($album): void {
            $album->load('videos');
            foreach ($album->videos as $video) {
                $this->videos->delete($video);
            }
            $cover = $album->cover_media_id;
            $album->delete();
            $media = $cover === null ? null : Media::query()->find($cover);
            if ($media !== null && ! $this->media->isReferenced($media)) {
                $this->media->delete($media);
            }
        });
    }
}
