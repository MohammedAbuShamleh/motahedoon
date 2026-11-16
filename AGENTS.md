<!-- memory-engine:begin -->
_محدَّث 2026-09-27 08:37 UTC — إن مضى أكثر من يوم على هذا الختم فشغّل `mem scan` قبل الاعتماد عليه._

# ذاكرة موقع متحدون

## استئناف — آخر جلسة (2026-09-07 · claude-code)

- **وقفنا عند:** المستخدم واجه خطأ npm run dev لأن المشروع بلا package.json (متوقع، لا خطوة بناء)؛ الوكيل شرح طريقة التشغيل الصحيحة عبر python -m http.server مع --directory motahidoon-site/motahidoon-site، وأعاد طرح سؤال معلّق عن هوية الشعار في صورة الافتتاحية
- **الخطوة التالية:** انتظار تأكيد المستخدم على هوية الشعار في صورة water-line.jpg، ثم المتابعة أو تعديل القصّ/الصورة إن كان شعار جهة خارجية
- **ملفات لُمست:** `D:\موقع متحدون\files\motahidoon-site\motahidoon-site\assets\img\logos\mutahidoon-full.png`، `D:\موقع متحدون\files\motahidoon-site\motahidoon-site\assets\img\logos\mutahidoon-mark.png`، `D:\موقع متحدون\files\motahidoon-site\motahidoon-site\assets\css\style.css`، `D:\موقع متحدون\files\motahidoon-site\motahidoon-site\assets\js\app.js`، `D:\موقع متحدون\files\motahidoon-site\motahidoon-site\README.md`، `D:\موقع متحدون\files\_v1\assets\css\style.css`، `D:\موقع متحدون\files\_v1\assets\js\app.js`

```bash
cd "D:\موقع متحدون\files" && claude --resume 14144308-9819-4b26-aad3-e04a5e054d3b
```

## ما هو صحيح الآن

**متحدون**
- arch.backup: نسخة التصميم الأولى محفوظة كاملة في مجلد _v1/ على القرص كنسخة احتياطية دائمة للرجوع، بعد أن لم تكن موجودة قبل إعادة التصميم
- arch.content: الموقع مبني على فصل بنيوي بين المتن (محتوى دائم لا يتغير بالفترة) والحاشية (محتوى موسوم بفترته الزمنية، كالتقرير الربعي)؛ كل رقم أو نص مرتبط بفترة يحمل وسم فترته بصرياً
- constraint.nobuild: المشروع ملفات ثابتة HTML/CSS/JS بلا package.json ولا خطوة بناء ولا تبعيات؛ يُشغَّل عبر python -m http.server مع --directory يشير إلى motahidoon-site/motahidoon-site/ (وليس جذر files/ الذي يحوي نسخة index.html قديمة معطوبة)
- misc.designroot: الموقع الفعلي يقع في مجلد motahidoon-site/motahidoon-site/ لا في جذر files/


## قرارات سابقة

- **فصل بنية الموقع إلى متن (دائم) وحاشية (مؤرَّخ بفترة زمنية)** — الموقع الأصلي كان واجهة عرض لتقرير ربعي؛ المطلوب موقع تعريفي دائم لا يبلى بعد ثلاثة أشهر
- **استعادة الشعار الكبير الملوّن والخلفية الدافئة والعنوان العريض 900 من النسخة الأولى** — المستخدم فضّل دفء التصميم الأول على برودة التصميم الجديد رغم صحة إعادة التموضع البنيوية، فأُبقيت البنية الجديدة مع دفء العرض القديم
- **الاحتفاظ بنسخة _v1/ على القرص كنسخة احتياطية دائمة** — لم تكن هناك نسخة احتياطية أصلية قبل استبدال style.css وapp.js، وهذا خطأ اعتُرف به وأُصلح بحفظ نسخة دائمة للرجوع
- **لم يُضف package.json للمشروع** — المشروع HTML/CSS/JS عادي بلا خطوة بناء أو تبعيات؛ إضافة package.json توحي زوراً بحاجته لـNode

## جلسات أخيرة

- 2026-09-07 · claude-code · claude-code:14144308-9819-4b26-aad3-e04a5e054d3b
<!-- memory-engine:end -->
