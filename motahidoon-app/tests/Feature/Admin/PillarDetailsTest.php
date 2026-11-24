<?php

namespace Tests\Feature\Admin;

use App\Contracts\ContentSource;
use App\Enums\UserRole;
use App\Models\Pillar;
use App\Models\Report;
use App\Models\ReportSection;
use Illuminate\Http\UploadedFile;

final class PillarDetailsTest extends AdminTestCase
{
    public function test_details_page_renders_for_every_pillar_and_is_closed_to_translators(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        foreach (Pillar::all() as $pillar) {
            $this->get("/admin/pillars/{$pillar->id}/details")->assertOk();
        }
        $this->actingAs($this->user(UserRole::Translator))
            ->get('/admin/pillars/1/details')->assertForbidden();
    }

    public function test_definition_is_sanitized_to_the_locked_palette_and_site_fonts(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $pillar = Pillar::query()->where('slug', 'health')->firstOrFail();

        $this->put("/admin/pillars/{$pillar->id}/details", [
            'definition' => '<p onclick="x()">أ<script>alert(1)</script><span style="color: #0C7B3F; position: fixed">ب</span>'
                .'<span style="color: #ff00ff">ج</span><a href="javascript:alert(1)">د</a> 12,013,597</p>',
            'translations' => ['en' => ['definition' => '<p><strong>Def</strong><iframe src="https://x"></iframe></p>'], 'tr' => ['definition' => '']],
        ])->assertSessionHasNoErrors();

        $pillar->refresh();
        $this->assertSame(
            '<p>أ<span style="color: #0C7B3F">ب</span><span>ج</span><a rel="noopener noreferrer">د</a> 12,013,597</p>',
            $pillar->definition,
        );
        $en = $pillar->translations()->where('locale', 'en')->where('field', 'definition')->firstOrFail();
        $this->assertSame('<p><strong>Def</strong></p>', $en->value);
        $this->assertSame('pending', $en->status->value);

        // ما يصل الموقع هو المنقّى نفسه
        $site = collect(app(ContentSource::class)->base()['pillars'])->firstWhere('id', 'health');
        $this->assertSame($pillar->definition, $site['definition']);
    }

    public function test_an_emptied_editor_leaves_the_reserved_slot(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $pillar = Pillar::query()->whereNotNull('definition')->firstOrFail();

        $this->put("/admin/pillars/{$pillar->id}/details", ['definition' => '<p></p>'])->assertSessionHasNoErrors();

        $this->assertNull($pillar->refresh()->definition);
    }

    public function test_legacy_plain_text_is_kept_byte_for_byte(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $pillar = Pillar::query()->whereNotNull('definition')->firstOrFail();
        $before = $pillar->definition;

        $this->put("/admin/pillars/{$pillar->id}/details", ['definition' => $before])->assertSessionHasNoErrors();

        $this->assertSame($before, $pillar->refresh()->definition);
    }

    public function test_section_rich_fields_are_sanitized_and_an_empty_item_is_rejected(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $section = ReportSection::query()->has('groups.items')->firstOrFail();
        $base = ['groups' => [['num' => '1', 'title' => 'ت', 'items' => [['body' => '<p></p>']]]]];

        $this->put("/admin/sections/{$section->id}", $base)
            ->assertSessionHasErrors('groups.0.items.0.body');

        $base['lead'] = '<h2>عنوان</h2><p><img src="data:image/png;base64,AA" onerror="x"></p>';
        $base['groups'][0]['items'][0]['body'] = '<p><mark style="background-color: #CF2129">٤٬٣٥٩</mark> درساً</p>';
        $this->put("/admin/sections/{$section->id}", $base)->assertSessionHasNoErrors();

        $section->refresh()->load('groups.items');
        $this->assertSame('<h2>عنوان</h2><p><img /></p>', $section->lead);
        // التظليل الأحمر خارج اللوحة يسقط، والرقم يبقى حرفياً
        $this->assertSame('<p><mark>٤٬٣٥٩</mark> درساً</p>', $section->groups[0]->items[0]->body);
    }

    public function test_pillar_can_be_added_to_a_report_once(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        $pillar = Pillar::query()->where('slug', 'health')->firstOrFail();
        $report = Report::query()->whereDoesntHave('sections', fn ($q) => $q->where('pillar_id', $pillar->id))->firstOrFail();

        $this->post("/admin/pillars/{$pillar->id}/sections", ['report_id' => $report->id])->assertSessionHasNoErrors();
        $this->assertTrue($report->sections()->where('pillar_id', $pillar->id)->exists());

        $this->post("/admin/pillars/{$pillar->id}/sections", ['report_id' => $report->id])
            ->assertSessionHasErrors('report_id');
    }

    public function test_editor_image_upload_returns_a_relative_url(): void
    {
        $this->actingAs($this->user(UserRole::Editor));

        $res = $this->postJson('/admin/rich-media', ['file' => UploadedFile::fake()->image('a.jpg', 400, 300)])->assertOk();

        $this->assertStringStartsWith('/uploads/', $res->json('url'));
    }
}
