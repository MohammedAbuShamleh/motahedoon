{{-- القالب الجذر للوحة التحكم. لا وسوم og: — اللوحة لا تُشارَك ولا تُفهرَس. --}}
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>لوحة التحكم — متحدون</title>
  <link rel="icon" href="{{ asset('assets/img/logos/mutahidoon-mark.png') }}">
  @viteReactRefresh
  @vite(['resources/css/admin.css', 'resources/js/admin.tsx'])
  @inertiaHead
</head>
<body class="bg-paper text-ink antialiased">
  @inertia
</body>
</html>
