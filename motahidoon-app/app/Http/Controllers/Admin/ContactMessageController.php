<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** صندوق رسائل «تواصل معنا»: الأحدث أوّلاً، وغير المقروءة موسومة. */
final class ContactMessageController extends Controller
{
    public function index(): Response
    {
        $messages = ContactMessage::query()->latest()->paginate(30);
        $unread = ContactMessage::query()->unread()->count();

        return Inertia::render('Admin/ContactMessages/Index', [
            'messages' => $messages->through(fn (ContactMessage $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'phone' => $m->phone,
                'message' => $m->message,
                'locale' => $m->locale,
                'read' => $m->read_at !== null,
                'at' => $m->created_at?->format('Y-m-d H:i'),
            ]),
            'unread' => $unread,
        ]);
    }

    /** وسم مقروءة أو غير مقروءة */
    public function update(Request $request, ContactMessage $message): RedirectResponse
    {
        $read = $request->validate(['read' => ['required', 'boolean']])['read'];
        $message->update(['read_at' => $read ? now() : null]);

        return back();
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return back()->with('success', 'تم حذف الرسالة.');
    }
}
