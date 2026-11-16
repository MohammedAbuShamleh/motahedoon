# تجمع متحدون من أجل غزة

مستودع فيه مشروعان ونسخة أرشيفية.

| المجلد | ما هو | الحالة |
|---|---|---|
| `motahidoon-app/` | **المشروع الحيّ** — Laravel 13 + Inertia 2 + React 19 + TS | قيد التطوير |
| `motahidoon-site/motahidoon-site/` | الموقع الثابت الأصلي (HTML/CSS/JS) | مرجع المقارنة — لا يُحذف |
| `_v1/` | نسخة التصميم الأولى | أرشيف |

## من أين تبدأ

**للباك-إند:** [`motahidoon-app/HANDOFF.md`](motahidoon-app/HANDOFF.md) —
اقرأه كاملاً قبل أي تعديل. فيه حدود حمراء للمحتوى لا تكشفها الشيفرة.

**لقرارات البنية:** [`motahidoon-site/motahidoon-site/docs/ARCHITECTURE.md`](motahidoon-site/motahidoon-site/docs/ARCHITECTURE.md)
— وثيقة القرار الكاملة: المكدّس، المخطط، المراحل، المخاطر.

## التشغيل

```bash
# المشروع الحيّ — artisan serve لا يعمل، المسار عربي. السبب في HANDOFF.md
cd motahidoon-app && composer install && npm install && npm run build
php -S 127.0.0.1:8130 -t public serve.php
```

```bash
# الموقع الثابت، للمقارنة
python -m http.server 8123 --directory motahidoon-site/motahidoon-site
```

## ثلاث قواعد لا تُكسر

1. **الأرقام تُستنسخ حرفياً ولا تُشتقّ.** لا جمع ولا تقريب ولا اختصار.
2. **الحقل الفارغ يَظهر خانةً محجوزة موسومة** ولا يُخفى ولا يُملأ ببديل.
3. **العربية مصدر السجل.** ما لم يُترجَم يُحذف من العرض الأجنبي ولا يُخلط.

التفصيل في `HANDOFF.md` قسم ٢.
