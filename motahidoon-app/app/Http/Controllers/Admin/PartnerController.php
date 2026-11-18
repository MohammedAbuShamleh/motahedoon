<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PartnerRequest;
use App\Http\Resources\Admin\PartnerResource;
use App\Models\Partner;
use App\Services\Admin\PartnerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class PartnerController extends Controller
{
    public function index(): Response
    {
        $partners = Partner::query()->ordered()->with('logo')->get();

        return Inertia::render('Admin/Partners/Index', ['partners' => PartnerResource::collection($partners)->resolve()]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Partners/Form', ['partner' => null]);
    }

    public function store(PartnerRequest $request, PartnerService $service): RedirectResponse
    {
        $service->save(null, $request->validated(), $request->user());

        return to_route('admin.partners.index')->with('success', 'أُضيف الشريك.');
    }

    public function edit(Partner $partner): Response
    {
        $partner->load(['logo', 'translations']);

        return Inertia::render('Admin/Partners/Form', ['partner' => PartnerResource::make($partner)->resolve()]);
    }

    public function update(PartnerRequest $request, Partner $partner, PartnerService $service): RedirectResponse
    {
        $service->save($partner, $request->validated(), $request->user());

        return to_route('admin.partners.index')->with('success', 'حُفظ الشريك.');
    }

    public function destroy(Partner $partner, PartnerService $service): RedirectResponse
    {
        $service->delete($partner);

        return to_route('admin.partners.index')->with('success', 'حُذف الشريك.');
    }
}
