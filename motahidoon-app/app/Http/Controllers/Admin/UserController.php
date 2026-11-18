<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Services\Admin\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class UserController extends Controller
{
    public function index(UserService $service): Response
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($service->listing())->resolve(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Form', ['user' => null, 'roles' => $this->roles()]);
    }

    public function store(UserRequest $request, UserService $service): RedirectResponse
    {
        $service->save(null, $request->validated());

        return to_route('admin.users.index')->with('success', 'أُضيف المستخدم.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Form', ['user' => UserResource::make($user)->resolve(), 'roles' => $this->roles()]);
    }

    public function update(UserRequest $request, User $user, UserService $service): RedirectResponse
    {
        $service->save($user, $request->validated());

        return to_route('admin.users.index')->with('success', 'حُفظ المستخدم.');
    }

    public function destroy(Request $request, User $user, UserService $service): RedirectResponse
    {
        $service->delete($user, $request->user());

        return to_route('admin.users.index')->with('success', 'حُذف المستخدم.');
    }

    /** @return array<string, string> */
    private function roles(): array
    {
        return collect(UserRole::cases())->mapWithKeys(fn ($r) => [$r->value => $r->label()])->all();
    }
}
