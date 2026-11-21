<?php

namespace Tests\Feature\Admin;

use App\Contracts\MediaStorage;
use App\Enums\UserRole;
use App\Models\User;
use App\Services\Media\PublicDirectoryStorage;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/**
 * أساس اختبارات اللوحة: قاعدة SQLite في الذاكرة (phpunit.xml) مع المحتوى
 * الحقيقي مستورَداً، والرفع إلى مجلد مؤقّت لا إلى public/ الحقيقي.
 */
abstract class AdminTestCase extends TestCase
{
    use RefreshDatabase;

    protected string $uploadRoot;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ContentSeeder::class);

        $this->uploadRoot = sys_get_temp_dir().DIRECTORY_SEPARATOR.'motahidoon-test-'.uniqid();
        $this->app->instance(MediaStorage::class, new PublicDirectoryStorage($this->uploadRoot, 'uploads'));
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->uploadRoot);
        parent::tearDown();
    }

    protected function user(UserRole $role): User
    {
        return User::factory()->create(['role' => $role]);
    }
}
