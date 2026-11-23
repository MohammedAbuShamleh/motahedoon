<?php

namespace App\Http\Requests\Admin;

/**
 * زرّ واتساب العائم. الرقم دولياً (مع مفتاح البلد)، تُقبل المسافات و«+» وتُحذف
 * عند الحفظ. النصوص اختيارية؛ الفارغ منها يسقط إلى النصّ الافتراضي، و«:org»
 * يُستبدل باسم التجمّع بلغة الصفحة.
 */
final class WhatsAppRequest extends AdminRequest
{
    public function rules(): array
    {
        return [
            'whatsapp_enabled' => ['required', 'boolean'],
            'whatsapp_number' => ['required', 'string', 'max:32', 'regex:/^\+?[0-9\s\-()]{8,32}$/'],
            'whatsapp_text' => ['nullable', 'array:ar,en,tr'],
            'whatsapp_text.*' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'whatsapp_number.required' => 'اكتب رقم واتساب.',
            'whatsapp_number.regex' => 'اكتب الرقم دولياً مع مفتاح البلد، مثل +90 553 082 77 11.',
        ];
    }
}
