<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * نموذج «تواصل معنا». وسيلة ردّ واحدة على الأقل (بريد أو هاتف)، ورسالة.
 * حقل website فخّ للبرامج الآلية: مخفيّ عن الزائر، وامتلاؤه يُسقط الطلب.
 * رسائل الخطأ بلغة الصفحة — لا ملفات لغة في المشروع، فهي هنا.
 */
final class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'required_without:phone', 'email', 'max:190'],
            'phone' => ['nullable', 'required_without:email', 'string', 'max:40', 'regex:/^[0-9+\-\s()]{6,40}$/'],
            'message' => ['required', 'string', 'min:5', 'max:3000'],
            'website' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        $m = [
            'ar' => [
                'name.required' => 'اكتب اسمك.',
                'email.required_without' => 'اكتب بريدك الإلكتروني أو رقم هاتفك لنردّ عليك.',
                'phone.required_without' => 'اكتب رقم هاتفك أو بريدك الإلكتروني لنردّ عليك.',
                'email.email' => 'البريد الإلكتروني غير صحيح.',
                'phone.regex' => 'رقم الهاتف غير صحيح.',
                'message.required' => 'اكتب رسالتك.',
                'message.min' => 'الرسالة قصيرة جداً.',
                'message.max' => 'الرسالة طويلة جداً (3000 حرف على الأكثر).',
            ],
            'en' => [
                'name.required' => 'Please enter your name.',
                'email.required_without' => 'Enter your email or phone so we can reply.',
                'phone.required_without' => 'Enter your phone or email so we can reply.',
                'email.email' => 'This email address is not valid.',
                'phone.regex' => 'This phone number is not valid.',
                'message.required' => 'Please write your message.',
                'message.min' => 'The message is too short.',
                'message.max' => 'The message is too long (3,000 characters at most).',
            ],
            'tr' => [
                'name.required' => 'Lütfen adınızı yazın.',
                'email.required_without' => 'Size dönebilmemiz için e-posta veya telefon yazın.',
                'phone.required_without' => 'Size dönebilmemiz için telefon veya e-posta yazın.',
                'email.email' => 'E-posta adresi geçerli değil.',
                'phone.regex' => 'Telefon numarası geçerli değil.',
                'message.required' => 'Lütfen mesajınızı yazın.',
                'message.min' => 'Mesaj çok kısa.',
                'message.max' => 'Mesaj çok uzun (en fazla 3.000 karakter).',
            ],
        ];

        return $m[app()->getLocale()] ?? $m['ar'];
    }
}
