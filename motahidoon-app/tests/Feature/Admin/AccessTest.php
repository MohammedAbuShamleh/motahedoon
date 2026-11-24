<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;

final class AccessTest extends AdminTestCase
{
    public function test_guests_are_sent_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->get('/admin/login')->assertOk();
    }

    public function test_login_and_logout(): void
    {
        $user = $this->user(UserRole::Editor);
        $this->post('/admin/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect('/admin');
        $this->assertAuthenticatedAs($user);
        $this->post('/admin/logout')->assertRedirect('/admin/login');
        $this->assertGuest();
    }

    public function test_wrong_password_is_rejected(): void
    {
        $user = $this->user(UserRole::Editor);
        $this->post('/admin/login', ['email' => $user->email, 'password' => 'nope'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_every_editor_page_renders(): void
    {
        $this->actingAs($this->user(UserRole::Editor));
        foreach (['/admin', '/admin/settings', '/admin/content-lines', '/admin/partners', '/admin/partners/create',
            '/admin/partners/1/edit', '/admin/pillars', '/admin/pillars/1/edit', '/admin/pillars/1/details', '/admin/pillars/guide', '/admin/field-photos', '/admin/media',
            '/admin/reports', '/admin/reports/create', '/admin/reports/1/edit', '/admin/sections/1/edit',
            '/admin/translations', '/admin/ui-strings'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_translator_is_limited_to_translations(): void
    {
        $this->actingAs($this->user(UserRole::Translator));
        $this->get('/admin/translations')->assertOk();
        $this->get('/admin/ui-strings')->assertOk();
        $this->get('/admin/partners')->assertForbidden();
        $this->get('/admin/reports')->assertForbidden();
        $this->post('/admin/translations/approve', ['ids' => [1]])->assertForbidden();
    }

    public function test_only_admins_manage_users(): void
    {
        $this->actingAs($this->user(UserRole::Editor))->get('/admin/users')->assertForbidden();
        $this->actingAs($this->user(UserRole::Admin))->get('/admin/users')->assertOk();
    }
}
