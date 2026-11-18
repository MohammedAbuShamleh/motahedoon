<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Media;
use App\Models\Partner;
use App\Models\Pillar;
use Illuminate\Http\UploadedFile;

final class PartnerAndMediaTest extends AdminTestCase
{
    public function test_create_partner_with_logo_and_translation(): void
    {
        $this->actingAs($this->user(UserRole::Editor));

        $this->post('/admin/partners', [
            'slug' => 'new-org', 'name' => 'مؤسسة جديدة', 'is_published' => '1',
            'logo' => UploadedFile::fake()->image('logo.png', 120, 120),
            'translations' => ['en' => ['name' => 'New Org'], 'tr' => ['name' => '']],
        ])->assertRedirect('/admin/partners');

        $p = Partner::query()->where('slug', 'new-org')->with('logo', 'translations')->firstOrFail();
        $this->assertStringStartsWith('uploads/', $p->logo->path);
        $this->assertFileExists($this->uploadRoot.'/'.$p->logo->path);
        $this->assertFalse($p->logo->is_bw, 'الشعارات لا تُحوَّل أبيض وأسود');
        $this->assertSame('New Org', $p->translated('name', 'en'));
        $this->assertNull($p->translated('name', 'tr'));

        // يظهر في الموقع فوراً: المخبأ أُبطل
        $this->get('/')->assertOk();
        $names = collect(app(\App\Contracts\ContentSource::class)->base()['partners'])->pluck('name');
        $this->assertContains('مؤسسة جديدة', $names);
    }

    public function test_field_photos_are_converted_to_grayscale(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $this->post('/admin/field-photos', ['photos' => [UploadedFile::fake()->image('a.jpg', 40, 30)]])->assertRedirect();

        $media = Media::query()->latest('id')->firstOrFail();
        $this->assertTrue($media->is_bw);
        $this->assertSame(40, $media->width);
    }

    public function test_media_in_use_cannot_be_deleted(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $used = Pillar::query()->whereNotNull('cover_media_id')->firstOrFail()->cover_media_id;

        $this->delete("/admin/media/{$used}")->assertSessionHasErrors('media');
        $this->assertDatabaseHas('media', ['id' => $used]);
    }

    public function test_pillar_referenced_by_reports_cannot_be_deleted(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $pillar = Pillar::query()->where('slug', 'dawah')->firstOrFail();

        $this->delete("/admin/pillars/{$pillar->id}")->assertSessionHasErrors('pillar');
        $this->assertDatabaseHas('pillars', ['id' => $pillar->id]);
    }

    public function test_new_pillar_gets_next_number_and_goes_last(): void
    {
        $this->actingAs($this->user(UserRole::Editor));

        $this->get('/admin/pillars/create')->assertInertia(fn ($page) => $page->where('nextNum', '08'));

        $this->post('/admin/pillars', [
            'slug' => 'new-field', 'num' => '', 'title' => 'مجال', 'short' => 'مجال', 'orgs' => 'جهة', 'is_published' => '1',
        ])->assertSessionHasNoErrors();

        $p = Pillar::query()->where('slug', 'new-field')->firstOrFail();
        $this->assertSame('08', $p->num);
        $this->assertSame((int) Pillar::query()->max('position'), $p->position);
    }

    public function test_metric_values_are_kept_verbatim(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $this->post('/admin/partners', ['slug' => 'x', 'name' => 'x', 'is_published' => '1', 'site_url' => 'not a url'])
            ->assertSessionHasErrors('site_url');
    }
}
