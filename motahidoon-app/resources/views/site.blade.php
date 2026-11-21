{{--
  القالب الجذر للواجهة العامة.

  وسوم <meta> و og: تُرسَم هنا **خادمياً** من بيانات يمرّرها الـController.
  هذا ليس تزيّداً: Inertia يرسم في المتصفّح، وزاحفات المعاينة في واتساب
  وفيسبوك وتيليجرام لا تنفّذ الجافاسكربت. بلا هذا القالب تصير كل رابط
  يُشارَك بلا صورة ولا عنوان — وهي قناة التوزيع الأولى للتجمّع.
--}}
<!doctype html>
<html lang="{{ $meta['lang'] }}" dir="{{ $meta['dir'] }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>{{ $meta['title'] }}</title>
  <meta name="description" content="{{ $meta['description'] }}">
  <meta name="theme-color" content="#0C7B3F">
  <link rel="icon" href="{{ asset('assets/img/logos/mutahidoon-mark.png') }}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="{{ $meta['title'] }}">
  <meta property="og:description" content="{{ $meta['description'] }}">
  <meta property="og:image" content="{{ asset($meta['image']) }}">
  <meta property="og:url" content="{{ url()->current() }}">
  <meta property="og:locale" content="{{ $meta['ogLocale'] }}">
  <meta name="twitter:card" content="summary_large_image">

  @foreach ($meta['alternates'] as $code => $href)
    <link rel="alternate" hreflang="{{ $code }}" href="{{ $href }}">
  @endforeach
  <link rel="canonical" href="{{ $meta['canonical'] }}">


  {{-- يحقن مقدّمة React Fast Refresh في وضع التطوير (npm run dev)؛
       بدونها يرمي @vitejs/plugin-react خطأ «can't detect preamble».
       في الإنتاج (بعد npm run build) لا يُخرج شيئاً. --}}
  @viteReactRefresh
  @vite(['resources/css/style.css', 'resources/js/site.tsx'])
  @inertiaHead
</head>
<body>
  <noscript>
    <p style="padding:2rem;text-align:center">هذا الموقع يحتاج تفعيل الجافاسكربت لعرض المحتوى.</p>
  </noscript>
  @inertia
</body>
</html>
