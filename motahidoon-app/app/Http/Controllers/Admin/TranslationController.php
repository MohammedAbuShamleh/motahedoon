<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TranslationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TranslationApproveRequest;
use App\Http\Requests\Admin\TranslationUpdateRequest;
use App\Http\Resources\Admin\TranslationResource;
use App\Models\Translation;
use App\Services\Admin\TranslationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TranslationController extends Controller
{
    public function index(Request $request, TranslationService $service): Response
    {
        $filters = $request->only(['locale', 'status', 'type', 'q']);

        return Inertia::render('Admin/Translations/Index', [
            'translations' => TranslationResource::collection($service->queue($filters))->response()->getData(true),
            'filters' => $filters,
            'types' => TranslationResource::TYPES,
            'statuses' => collect(TranslationStatus::cases())->mapWithKeys(fn ($s) => [$s->value => $s->label()]),
        ]);
    }

    public function update(TranslationUpdateRequest $request, Translation $translation, TranslationService $service): RedirectResponse
    {
        $service->update($translation, $request->validated('value'), $request->user());

        return back()->with('success', 'تم حفظ الترجمة، وهي الآن بانتظار اعتماد المدير.');
    }

    public function approve(TranslationApproveRequest $request, TranslationService $service): RedirectResponse
    {
        $n = $service->approve($request->validated('ids'), $request->user());

        return back()->with('success', "تم اعتماد {$n} ترجمة.");
    }
}
