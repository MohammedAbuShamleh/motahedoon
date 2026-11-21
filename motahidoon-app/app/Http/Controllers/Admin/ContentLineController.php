<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentLineGroup;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ContentLineRequest;
use App\Http\Resources\Admin\ContentLineResource;
use App\Models\ContentLine;
use App\Services\Admin\ContentLineService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class ContentLineController extends Controller
{
    public function index(ContentLineService $service): Response
    {
        return Inertia::render('Admin/ContentLines/Index', [
            'lines' => ContentLineResource::collection($service->listing())->resolve(),
            'groups' => collect(ContentLineGroup::cases())->map(fn ($g) => [
                'value' => $g->value, 'label' => $g->label(), 'hasTerm' => $g->hasTerm(),
            ]),
        ]);
    }

    public function store(ContentLineRequest $request, ContentLineService $service): RedirectResponse
    {
        $service->create($request->validated(), $request->user());

        return back()->with('success', 'تمت إضافة النصّ.');
    }

    public function update(ContentLineRequest $request, ContentLine $line, ContentLineService $service): RedirectResponse
    {
        $service->update($line, $request->validated(), $request->user());

        return back()->with('success', 'تم حفظ النصّ.');
    }

    public function destroy(ContentLine $line, ContentLineService $service): RedirectResponse
    {
        $service->delete($line);

        return back()->with('success', 'تم حذف النصّ.');
    }
}
