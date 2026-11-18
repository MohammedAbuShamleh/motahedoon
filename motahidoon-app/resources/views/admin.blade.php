{{-- القالب الجذر للوحة التحكم. لا وسوم og: — اللوحة لا تُشارَك ولا تُفهرَس. --}}
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>لوحة التحكم — متحدون</title>
  <link rel="icon" href="{{ asset('assets/img/logos/mutahidoon-mark.png') }}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap">
  @viteReactRefresh
  @vite(['resources/css/admin.css', 'resources/js/admin.tsx'])
  @inertiaHead
</head>
<body class="bg-paper text-ink antialiased">
  @inertia
</body>
</html>
