<?php

namespace App\Services\Admin;

use App\Models\FieldPhoto;
use App\Models\User;
use App\Services\Media\MediaService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

final class FieldPhotoService
{
    public function __construct(private readonly MediaService $media) {}

    /** @return Collection<int, FieldPhoto> صور الميدان بترتيب العرض، مع ملفاتها */
    public function listing(): Collection
    {
        return FieldPhoto::query()->ordered()->with('media')->get();
    }

    /** @param list<UploadedFile> $files */
    public function add(array $files, User $by): void
    {
        DB::transaction(function () use ($files, $by): void {
            foreach ($files as $file) {
                FieldPhoto::query()->create(['media_id' => $this->media->upload($file, true, $by->id)->id]);
            }
        });
    }

    /** @param list<int> $ids */
    public function reorder(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            $photos = FieldPhoto::query()->whereIn('id', $ids)->get()->keyBy('id');
            foreach (array_values($ids) as $i => $id) {
                $photos->get($id)?->update(['position' => $i + 1]);
            }
        });
    }

    public function delete(FieldPhoto $photo): void
    {
        DB::transaction(function () use ($photo): void {
            $media = $photo->media;
            $photo->delete();
            if (! $this->media->isReferenced($media)) {
                $this->media->delete($media);
            }
        });
    }
}
