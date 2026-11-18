<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SiteSettingRequest;
use App\Http\Resources\Admin\SiteSettingResource;
use App\Models\SiteSetting;
use App\Services\Admin\SiteSettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class SiteSettingController extends Controller
{
    public function edit(): Response
    {
        $settings = SiteSetting::query()->with(['logoFull', 'logoMark', 'donateQr', 'translations'])->firstOrFail();

        return Inertia::render('Admin/Settings/Edit', ['settings' => SiteSettingResource::make($settings)->resolve()]);
    }

    public function update(SiteSettingRequest $request, SiteSettingService $service): RedirectResponse
    {
        $service->update($request->validated(), $request->user());

        return back()->with('success', 'حُفظت الهوية والإعدادات.');
    }
}
