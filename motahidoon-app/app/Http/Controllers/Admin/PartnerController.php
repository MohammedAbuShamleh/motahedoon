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
    public function index(PartnerService $service): Response
    {
        return Inertia::render('Admin/Partners/Index', ['partners' => PartnerResource::collection($service->listing())->resolve()]);
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

    public function edit(Partner $partner, PartnerService $service): Response
    {
        return Inertia::render('Admin/Partners/Form', ['partner' => PartnerResource::make($service->forEdit($partner))->resolve()]);
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
