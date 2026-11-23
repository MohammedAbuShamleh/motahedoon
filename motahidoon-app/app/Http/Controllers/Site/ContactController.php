<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;

/** يستقبل نموذج «تواصل معنا» ويحفظه لتقرأه اللوحة. */
final class ContactController extends Controller
{
    public function store(ContactRequest $request): RedirectResponse
    {
        ContactMessage::query()->create([
            ...$request->safe()->only(['name', 'email', 'phone', 'message']),
            'locale' => app()->getLocale(),
            // بصمة مقطوعة لا العنوان نفسه: تكفي لرؤية الإغراق من مصدر واحد
            'ip_hash' => substr(hash('sha256', $request->ip().config('app.key')), 0, 16),
        ]);

        // النموذج يعرض شكره بنفسه عند النجاح (onSuccess) — لا رسالة خادمية
        return back();
    }
}
