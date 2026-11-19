<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UiStringRequest;
use App\Http\Resources\Admin\Translations;
use App\Models\UiString;
use App\Services\Admin\UiStringService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class UiStringController extends Controller
{
    public function index(UiStringService $service): Response
    {
        $strings = $service->listing()
            ->map(fn (UiString $u) => ['id' => $u->id, 'key' => $u->key, 'translations' => Translations::of($u, ['value'])]);

        return Inertia::render('Admin/UiStrings/Index', ['strings' => $strings]);
    }

    public function store(UiStringRequest $request, UiStringService $service): RedirectResponse
    {
        $service->save(null, $request->validated(), $request->user());

        return back()->with('success', 'تمت إضافة الكلمة.');
    }

    public function update(UiStringRequest $request, UiString $string, UiStringService $service): RedirectResponse
    {
        $service->save($string, $request->validated(), $request->user());

        return back()->with('success', 'تم حفظ الترجمة.');
    }

    public function destroy(UiString $string, UiStringService $service): RedirectResponse
    {
        $service->delete($string);

        return back()->with('success', 'تم حذف الكلمة.');
    }
}
