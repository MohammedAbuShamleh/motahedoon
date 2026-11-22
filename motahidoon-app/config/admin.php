<?php

/* حساب المدير الأوّل الذي يُنشئه DatabaseSeeder، وحدود الرفع في اللوحة. */
return [
    'name' => env('ADMIN_NAME', 'مدير الموقع'),
    'email' => env('ADMIN_EMAIL', 'admin@motahidoon.test'),
    'password' => env('ADMIN_PASSWORD', 'change-me-now'),

    /* أقصى حجم لملفّ فيديو مرفوع بالكيلوبايت (100MB افتراضياً). لا يتجاوز
       upload_max_filesize وpost_max_size في php.ini على الخادم — إن كانا أصغر
       رُفض الملف قبل أن يصل إلى Laravel. للمقاطع الطويلة: رابط يوتيوب. */
    'video_max_kb' => (int) env('ADMIN_VIDEO_MAX_KB', 102400),
];
