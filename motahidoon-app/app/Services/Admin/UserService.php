<?php

namespace App\Services\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class UserService
{
    /** @param array<string, mixed> $data */
    public function save(?User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            $user ??= new User;
            $role = UserRole::from($data['role']);

            if ($user->exists && $user->role === UserRole::Admin && $role !== UserRole::Admin) {
                $this->guardLastAdmin($user);
            }

            $user->fill(['name' => $data['name'], 'email' => $data['email'], 'role' => $role]);
            if (! empty($data['password'])) {
                $user->password = $data['password'];   // يُجزَّأ بالـcast
            }
            $user->save();

            return $user;
        });
    }

    public function delete(User $user, User $by): void
    {
        if ($user->is($by)) {
            throw ValidationException::withMessages(['user' => 'لا يمكنك حذف حسابك وأنت داخل به.']);
        }
        DB::transaction(function () use ($user): void {
            if ($user->role === UserRole::Admin) {
                $this->guardLastAdmin($user);
            }
            $user->delete();
        });
    }

    /** لا تبقى اللوحة بلا مدير. */
    private function guardLastAdmin(User $user): void
    {
        $others = User::query()->where('role', UserRole::Admin)->whereKeyNot($user->id)->lockForUpdate()->count();
        if ($others === 0) {
            throw ValidationException::withMessages(['role' => 'هذا آخر مدير في النظام؛ عيّن مديراً آخر أولاً.']);
        }
    }
}
