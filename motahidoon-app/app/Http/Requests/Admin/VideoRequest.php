<?php

namespace App\Http\Requests\Admin;

use App\Models\Video;
use App\Support\VideoSource;
use Closure;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * مقطع: رابط يوتيوب/فيسبوك أو ملف مرفوع. الملف مطلوب للمصدر «ملف» إلا إن
 * كان للمقطع ملف سابق يبقى. المدّة نصّ بصيغة الساعة (4:12 أو 1:04:12).
 */
final class VideoRequest extends AdminRequest
{
    public function rules(): array
    {
        $maxKb = (int) config('admin.video_max_kb');

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'source' => ['required', Rule::in([Video::SOURCE_URL, Video::SOURCE_FILE])],
            'url' => [
                'nullable', 'required_if:source,'.Video::SOURCE_URL, 'url', 'max:512',
                function (string $attr, mixed $value, Closure $fail): void {
                    if ($this->input('source') === Video::SOURCE_URL && is_string($value) && VideoSource::parse($value) === null) {
                        $fail('الرابط يجب أن يكون من يوتيوب أو فيسبوك.');
                    }
                },
            ],
            'file' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', "max:{$maxKb}"],
            'duration' => ['nullable', 'string', 'regex:/^\d{1,2}(:\d{2}){1,2}$/'],
            'recorded_on' => ['nullable', 'date'],
            'is_featured' => ['required', 'boolean'],
            'is_published' => ['required', 'boolean'],
            'position' => ['nullable', 'integer', 'min:1', 'max:65000'],
            ...$this->imageRules('poster', 8192),
            ...$this->translationRules(['title', 'description'], 2000),
        ];
    }

    public function messages(): array
    {
        return [
            'url.required_if' => 'ألصق رابط المقطع من يوتيوب أو فيسبوك.',
            'file.mimetypes' => 'الملف يجب أن يكون فيديو MP4 أو WebM أو MOV.',
            'file.max' => 'الملف أكبر من الحدّ المسموح. للمقاطع الطويلة استعمل رابط يوتيوب.',
            'duration.regex' => 'اكتب المدّة بصيغة 4:12 أو 1:04:12.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $v): void {
                if ($this->input('source') !== Video::SOURCE_FILE || $this->hasFile('file')) {
                    return;
                }
                /** @var Video|null $video */
                $video = $this->route('video');
                if ($video?->media_id === null) {
                    $v->errors()->add('file', 'ارفع ملف الفيديو.');
                }
            },
        ];
    }
}
