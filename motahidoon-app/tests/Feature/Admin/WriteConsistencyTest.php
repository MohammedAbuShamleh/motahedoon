<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\ContentLine;
use App\Models\Media;
use App\Models\Translation;
use App\Services\Media\MediaService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * اتّساق الكتابات متعدّدة الخطوات: الحذف معاملة واحدة مع ترجماته، والملف على
 * القرص يتبع سجلّه — لا ملف بلا سجلّ، ولا سجلّ يشير إلى ملف مفقود.
 */
final class WriteConsistencyTest extends AdminTestCase
{
    public function test_deleting_unused_media_removes_the_row_and_then_the_file(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $this->post('/admin/media', ['files' => [UploadedFile::fake()->image('a.png', 20, 20)], 'bw' => '0'])
            ->assertRedirect();
        $media = Media::query()->latest('id')->firstOrFail();
        $file = $this->uploadRoot.'/'.$media->path;
        $this->assertFileExists($file);

        $this->delete("/admin/media/{$media->id}")->assertRedirect();

        $this->assertModelMissing($media);
        $this->assertFileDoesNotExist($file);
    }

    public function test_deleting_a_content_line_takes_its_translations_with_it(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $this->post('/admin/content-lines', [
            'group' => 'goal', 'body' => 'سطر للاختبار',
            'translations' => ['en' => ['body' => 'Test line'], 'tr' => ['body' => 'Test satırı']],
        ])->assertRedirect();
        $line = ContentLine::query()->latest('id')->firstOrFail();
        $this->assertSame(2, $line->translations()->count());

        $this->delete("/admin/content-lines/{$line->id}")->assertRedirect();

        $this->assertModelMissing($line);
        $this->assertSame(0, Translation::query()
            ->where('translatable_type', 'content_line')->where('translatable_id', $line->id)->count());
    }

    public function test_an_upload_inside_a_rolled_back_transaction_leaves_no_file(): void
    {
        $path = null;
        try {
            DB::transaction(function () use (&$path): void {
                $path = app(MediaService::class)->upload(UploadedFile::fake()->image('b.png', 20, 20))->path;
                throw new RuntimeException('فشل حفظ لاحق بعد الرفع');
            });
        } catch (RuntimeException) {
            // التراجع مقصود: الملف يجب أن يُحذف معه
        }

        $this->assertNotNull($path);
        $this->assertFileDoesNotExist($this->uploadRoot.'/'.$path);
    }
}
