<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        /* حساب المدير الأوّل من الإعدادات (config/admin.php ← .env).
           كلمة المرور الافتراضية للتطوير المحلي وحده؛ تُغيَّر فوراً. */
        User::query()->updateOrCreate(
            ['email' => config('admin.email')],
            [
                'name' => config('admin.name'),
                'password' => config('admin.password'),
                'role' => UserRole::Admin,
            ],
        );

        $this->call(ContentSeeder::class);
    }
}
