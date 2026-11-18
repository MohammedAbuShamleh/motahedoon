<?php

namespace Tests\Feature\Admin;

use App\Enums\TranslationStatus;
use App\Enums\UserRole;
use App\Models\Translation;
use App\Models\User;

final class TranslationAndUserTest extends AdminTestCase
{
    public function test_edit_makes_translation_pending_and_admin_approves(): void
    {
        $t = Translation::query()->where('locale', 'en')->firstOrFail();

        $this->actingAs($this->user(UserRole::Translator))
            ->put("/admin/translations/{$t->id}", ['value' => 'Revised'])->assertSessionHasNoErrors();
        $this->assertSame(TranslationStatus::Pending, $t->fresh()->status);

        $this->actingAs($this->user(UserRole::Admin))
            ->post('/admin/translations/approve', ['ids' => [$t->id]])->assertSessionHasNoErrors();
        $this->assertSame(TranslationStatus::Approved, $t->fresh()->status);
    }

    public function test_unapproved_notice_disappears_when_everything_is_approved(): void
    {
        $this->assertNotNull(app(\App\Contracts\ContentSource::class)->overlay('en')['unapproved'] ?? null);

        Translation::query()->where('locale', 'en')->get()
            ->each(fn (Translation $t) => $t->update(['status' => TranslationStatus::Approved]));

        // مصدر جديد (لا ذاكرة طلب سابق)؛ المخبأ أُبطل بالحفظ
        $this->app->forgetInstance(\App\Contracts\ContentSource::class);
        $this->assertArrayNotHasKey('unapproved', app(\App\Contracts\ContentSource::class)->overlay('en'));
    }

    public function test_last_admin_cannot_be_demoted_or_deleted(): void
    {
        $admin = $this->user(UserRole::Admin);
        $this->actingAs($admin);

        $this->put("/admin/users/{$admin->id}", ['name' => 'x', 'email' => $admin->email, 'role' => 'editor'])
            ->assertSessionHasErrors('role');

        $other = $this->user(UserRole::Admin);
        $this->actingAs($other)->delete("/admin/users/{$other->id}")->assertSessionHasErrors('user');
        $this->delete("/admin/users/{$admin->id}")->assertRedirect('/admin/users');
        $this->assertNull(User::query()->find($admin->id));
    }
}
