<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PillarRequest;
use App\Http\Resources\Admin\PillarResource;
use App\Models\Pillar;
use App\Services\Admin\PillarService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class PillarController extends Controller
{
    public function index(): Response
    {
        $pillars = Pillar::query()->ordered()->with('cover')->get();

        return Inertia::render('Admin/Pillars/Index', ['pillars' => PillarResource::collection($pillars)->resolve()]);
    }

    public function create(PillarService $service): Response
    {
        return Inertia::render('Admin/Pillars/Form', ['pillar' => null, 'nextNum' => $service->nextNum()]);
    }

    public function store(PillarRequest $request, PillarService $service): RedirectResponse
    {
        $service->save(null, $request->validated(), $request->user());

        return to_route('admin.pillars.index')->with('success', 'أُضيف المجال.');
    }

    public function edit(Pillar $pillar): Response
    {
        $pillar->load(['cover', 'translations']);

        return Inertia::render('Admin/Pillars/Form', ['pillar' => PillarResource::make($pillar)->resolve()]);
    }

    public function update(PillarRequest $request, Pillar $pillar, PillarService $service): RedirectResponse
    {
        $service->save($pillar, $request->validated(), $request->user());

        return to_route('admin.pillars.index')->with('success', 'حُفظ المجال.');
    }

    public function destroy(Pillar $pillar, PillarService $service): RedirectResponse
    {
        $service->delete($pillar);

        return to_route('admin.pillars.index')->with('success', 'حُذف المجال.');
    }
}
