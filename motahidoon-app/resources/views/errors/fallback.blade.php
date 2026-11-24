{{--
  صفحة الخطأ الأخيرة: تُرسم حين تعجز صفحة الموقع نفسها (القاعدة متوقّفة،
  أو الخطأ وقع قبل وسيط الويب). مستقلّة تماماً: بلا Vite ولا قاعدة ولا
  جلسة — CSS مضمَّن وشعار من public. بلغة الموقع وألوانه، زوايا مربّعة.
--}}
@php
  // ?lang= أوّلاً: الخطأ قد يقع قبل وسيط اللغة فلا تُضبط لغة التطبيق
  $locale = collect([request()->query('lang'), app()->getLocale()])
      ->first(fn ($l) => in_array($l, ['ar', 'en', 'tr'], true)) ?? 'ar';
  $t = [
    'ar' => [
      'dir' => 'rtl', 'org' => 'تجمع متحدون من أجل غزة', 'err' => 'خطأ', 'home' => 'العودة إلى الرئيسية', 'retry' => 'تحديث الصفحة',
      403 => ['لا تملك صلاحية الوصول إلى هذه الصفحة', 'هذه الصفحة غير متاحة لك.'],
      404 => ['هذه الصفحة غير موجودة', 'الرابط لا يطابق أي مجال عمل ولا أي تقرير في الموقع.'],
      419 => ['انتهت صلاحية الصفحة', 'مرّ وقت طويل منذ فتح الصفحة. حدّثها ثم أعد المحاولة.'],
      429 => ['طلبات كثيرة في وقت قصير', 'انتظر دقيقة ثم أعد المحاولة.'],
      500 => ['حدث خطأ غير متوقّع', 'تعذّر عرض هذه الصفحة الآن. حاول مرة أخرى بعد قليل.'],
      503 => ['الموقع قيد الصيانة', 'نعمل على تحديث الموقع، وسيعود خلال وقت قصير.'],
    ],
    'en' => [
      'dir' => 'ltr', 'org' => 'Mutahidoon for Gaza Coalition', 'err' => 'Error', 'home' => 'Back to home', 'retry' => 'Reload page',
      403 => ['You do not have access to this page', 'This page is not available to you.'],
      404 => ['This page does not exist', 'The link does not match any area of work or any report on this site.'],
      419 => ['This page has expired', 'The page has been open for a long time. Reload it and try again.'],
      429 => ['Too many requests', 'Please wait a minute and try again.'],
      500 => ['Something went wrong', 'This page cannot be shown right now. Please try again shortly.'],
      503 => ['The site is under maintenance', 'We are updating the site. It will be back shortly.'],
    ],
    'tr' => [
      'dir' => 'ltr', 'org' => 'Gazze İçin Mutahidoon Koalisyonu', 'err' => 'Hata', 'home' => 'Ana sayfaya dön', 'retry' => 'Sayfayı yenile',
      403 => ['Bu sayfaya erişim yetkiniz yok', 'Bu sayfa sizin için kullanılabilir değil.'],
      404 => ['Bu sayfa mevcut değil', 'Bağlantı sitedeki hiçbir çalışma alanı veya raporla eşleşmiyor.'],
      419 => ['Sayfanın süresi doldu', 'Sayfa uzun süredir açık. Yenileyip tekrar deneyin.'],
      429 => ['Çok fazla istek', 'Lütfen bir dakika bekleyip tekrar deneyin.'],
      500 => ['Beklenmeyen bir hata oluştu', 'Bu sayfa şu anda gösterilemiyor. Lütfen biraz sonra tekrar deneyin.'],
      503 => ['Site bakımda', 'Siteyi güncelliyoruz, kısa süre içinde geri döneceğiz.'],
    ],
  ][$locale];
  $code = in_array($status, [403, 404, 419, 429, 500, 503], true) ? $status : 500;
  [$title, $text] = $t[$code];
  $home = $locale === 'ar' ? '/' : '/?lang='.$locale;
@endphp
<!doctype html>
<html lang="{{ $locale }}" dir="{{ $t['dir'] }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#0C7B3F">
  <title>{{ $code }} — {{ $title }}</title>
  <link rel="icon" href="/assets/img/logos/mutahidoon-mark.png">
  <style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0}
    body{min-height:100vh;display:flex;flex-direction:column;background:#FCFCFA;color:#1A1A1A;
      font-family:"Thmanyah Sans","Segoe UI",Tahoma,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
    header{display:flex;align-items:center;gap:.75rem;padding:1.1rem clamp(1.25rem,5vw,3.5rem);border-bottom:1px solid #E3E4E5}
    header img{width:36px;height:36px;object-fit:contain}
    header b{font-size:.95rem}
    main{flex:1;display:flex;align-items:center;padding:clamp(2.5rem,7vw,6rem) clamp(1.25rem,5vw,3.5rem)}
    .in{width:min(100%,1240px);margin-inline:auto}
    .k{display:inline-flex;align-items:center;gap:.6rem;font-size:.82rem;font-weight:700;letter-spacing:.06em;color:#5C5B34}
    .k::before{content:"";width:.5rem;height:.5rem;background:#CF2129;transform:rotate(45deg)}
    .code{margin:1rem 0 0;font-weight:900;line-height:.82;font-size:clamp(6.5rem,21vw,15rem);letter-spacing:-.06em;
      color:transparent;-webkit-text-stroke:2px #1A1A1A;width:fit-content;direction:ltr}
    .code::after{content:"";display:block;height:4px;width:38%;margin-top:1.4rem;background:#CF2129}
    h1{margin:2.25rem 0 0;font-weight:900;font-size:clamp(1.8rem,4.1vw,3.1rem);letter-spacing:-.035em;max-width:22ch}
    p.t{margin:1.2rem 0 0;font-weight:300;font-size:clamp(1.12rem,.8vw + .95rem,1.42rem);line-height:1.78;color:rgba(26,26,26,.65);max-width:60ch}
    .a{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2.5rem}
    .btn{display:inline-flex;align-items:center;height:3rem;padding:0 1.4rem;font:inherit;font-weight:700;font-size:.95rem;
      text-decoration:none;border:1px solid transparent;cursor:pointer;transition:background .2s,border-color .2s,color .2s}
    .g{background:#0C7B3F;color:#FCFCFA}.g:hover{background:#1A1A1A}
    .o{background:#FCFCFA;border-color:#E3E4E5;color:#1A1A1A}.o:hover{border-color:#5C5B34;color:#5C5B34}
    .btn:focus-visible{outline:2px solid #CF2129;outline-offset:3px}
  </style>
</head>
<body>
  <header>
    <img src="/assets/img/logos/mutahidoon-mark.png" alt="">
    <b>{{ $t['org'] }}</b>
  </header>
  <main>
    <div class="in">
      <p class="k">{{ $t['err'] }} <span dir="ltr">{{ $code }}</span></p>
      <p class="code" aria-hidden="true">{{ $code }}</p>
      <h1>{{ $title }}</h1>
      <p class="t">{{ $text }}</p>
      <div class="a">
        <a class="btn g" href="{{ $home }}">{{ $t['home'] }}</a>
        <button class="btn o" type="button" onclick="location.reload()">{{ $t['retry'] }}</button>
      </div>
    </div>
  </main>
</body>
</html>
