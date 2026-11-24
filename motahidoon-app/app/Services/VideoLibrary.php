<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Video;
use App\Models\VideoAlbum;
use App\Services\Content\ContentCache;

/**
 * مكتبة الفيديو للواجهة العامة — شجرة لكلّ لغة، مخبّأة مع شجرة المحتوى
 * وتُبطَل معها عند أيّ كتابة (FlushesContentCache على النموذجين).
 *
 * قاعدة اللغات كبقية الموقع: العربية مصدر السجل، وفي الإنجليزية والتركية
 * لا يُعرض إلا ما تُرجم عنوانه — ألبوم أو مقطع بلا عنوان مترجَم يُسقَط
 * من العرض الأجنبي ولا يظهر بالعربية داخل صفحة أجنبية. الوصف المترجَم
 * اختياري: إن غاب لا يُعرض وصف.
 */
final class VideoLibrary
{
    public function __construct(private readonly ContentCache $cache) {}

    /** الألبومات المنشورة بمقاطعها المنشورة، بالترتيب التحريري. @return list<array<string, mixed>> */
    public function albums(): array
    {
        $locale = app()->getLocale();

        return $this->cache->remember("videos.{$locale}", fn () => $this->build($locale));
    }

    /** ألبوم واحد بمعرّفه في الرابط، أو null. @return array<string, mixed>|null */
    public function album(string $slug): ?array
    {
        return collect($this->albums())->firstWhere('slug', $slug);
    }

    /**
     * المقاطع كلّها مرتّبةً: المميّزة أوّلاً، ثم الأحدث تاريخاً، ثم الأحدث إضافةً.
     * بحدٍّ لقسم الرئيسية، وبلا حدّ لصفحة المكتبة.
     *
     * @return list<array<string, mixed>>
     */
    public function highlights(?int $limit = null): array
    {
        return collect($this->albums())
            ->flatMap(fn (array $a) => $a['videos'])
            ->sortBy([
                fn ($a, $b) => $b['featured'] <=> $a['featured'],
                fn ($a, $b) => ($b['date'] ?? '') <=> ($a['date'] ?? ''),
                fn ($a, $b) => $b['id'] <=> $a['id'],
            ])
            ->when($limit !== null, fn ($c) => $c->take($limit))->values()->all();
    }

    /** @return list<array<string, mixed>> */
    private function build(string $locale): array
    {
        $tr = fn ($q) => $q->where('locale', $locale);
        $albums = VideoAlbum::query()->published()->ordered()
            ->with([
                'cover', 'pillar', 'translations' => $tr,
                'videos' => fn ($q) => $q->published()->with(['file', 'poster', 'translations' => $tr]),
            ])->get();

        $foreign = $locale !== 'ar';
        $text = fn ($model, string $field): ?string => $foreign
            ? $model->translated($field, $locale)
            : $model->getAttribute($field);

        $out = [];
        foreach ($albums as $album) {
            $title = $text($album, 'title');
            if ($title === null) {
                continue;
            }
            $node = ['slug' => $album->slug, 'title' => $title];

            $videos = [];
            foreach ($album->videos as $v) {
                $item = $this->video($v, $text, $node);
                if ($item !== null) {
                    $videos[] = $item;
                }
            }
            if ($videos === []) {
                continue;                      // ألبوم بلا مقطع ظاهر لا يُعرض
            }

            $out[] = [
                ...$node,
                'description' => $text($album, 'description'),
                'cover' => $this->url($album->cover) ?? $videos[0]['poster'],
                'pillar' => $album->pillar?->slug,
                'count' => count($videos),
                'videos' => $videos,
            ];
        }

        return $out;
    }

    /**
     * @param  callable(object, string): ?string  $text
     * @param  array{slug: string, title: string}  $album
     * @return array<string, mixed>|null
     */
    private function video(Video $v, callable $text, array $album): ?array
    {
        $title = $text($v, 'title');
        if ($title === null) {
            return null;
        }

        $link = $v->linked();
        if ($v->source === Video::SOURCE_URL && $link === null) {
            return null;                       // رابط لم يعد صالحاً: لا مشغّل معطوب
        }
        if ($v->source === Video::SOURCE_FILE && $v->file === null) {
            return null;
        }

        return [
            'id' => $v->id,
            'title' => $title,
            'description' => $text($v, 'description'),
            'kind' => $link?->provider ?? 'file',
            'embed' => $link?->embed(),
            'src' => $link === null ? $this->url($v->file) : null,
            'poster' => $this->url($v->poster) ?? $link?->thumbnail(),
            'duration' => $v->duration,
            'date' => $v->recorded_on?->toDateString(),
            'featured' => $v->is_featured,
            'album' => $album,
        ];
    }

    private function url(?Media $media): ?string
    {
        return $media === null ? null : '/'.ltrim($media->path, '/');
    }
}
