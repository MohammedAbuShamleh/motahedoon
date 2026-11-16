# هيكلية التحويل — Laravel + Inertia + React/TS + لوحة تحكم

_وثيقة قرار. لا كود بعد. تُقرأ قبل أول `composer create-project`._

---

## 0 · لماذا الآن — وما الذي يتغيّر فعلاً

في جلسة سابقة اخترتَ «ابقَ ثابتاً». كان القرار صحيحاً حينها لأن المحتوى لم
يكن يتغيّر بيد أحد. **طلب لوحة التحكم يغيّر المعادلة فعلاً**: محتوى يحرّره
بشر، ويُترجَم ويُعتمد بمراحل، ويُؤرشَف كل ربع سنة — هذا نظام، لا ملف.

لكن انتبه لما تخسره بالضبط، فهذه ليست ترقية مجانية:

| اليوم (ثابت) | بعد التحويل |
|---|---|
| `data.js` ملف واحد، تَحقَّقَ منه مدقّق آلي أن **٦٧٢ نصّاً** تنجو حرفياً | المحتوى في MySQL يحرّره بشر — السلامة تصبح **انضباطاً تحريرياً** لا ضماناً برمجياً |
| يُرفع على أي استضافة ثابتة، بلا خادم ولا قاعدة | يحتاج PHP + MySQL، نسخاً احتياطية، وتحديثات أمنية |
| لا شيء ينكسر لأن لا شيء يتحرّك | سطح هجوم جديد: تسجيل دخول، رفع ملفات، صلاحيات |

التخفيف: **المدقّق نفسه يُعاد تشغيله على ناتج قاعدة البيانات** بعد الترحيل
(القسم ٨)، فإن سقط نصّ واحد ظهر فوراً.

---

## 1 · الوحدات (قبل أي كود)

خمس وحدات عمل + اثنتان عَرَضيّتان:

| # | الوحدة | تملك |
|---|---|---|
| 1 | **Identity** | الهوية، الرؤية، الرسالة، التأسيس، الأهداف، التطلعات، الحوكمة، التمهيد، التواصل، التبرع |
| 2 | **Partners** | المؤسسات الشريكة وشعاراتها وأدوارها |
| 3 | **Pillars** | مجالات العمل (دائمة) وأغلفتها |
| 4 | **Reports** | التقارير الدورية وأرشيفها — أثقل وحدة |
| 5 | **Media** | مكتبة الصور والملفات |
| — | **Localization** | الترجمة والاعتماد — عَرَضيّة |
| — | **Access** | المستخدمون والصلاحيات وسجل النشاط — عَرَضيّة |

**Reports لا تقرأ جداول Pillars مباشرة**؛ تمرّ بعقد `PillarCatalog` تعلنه
وحدة Pillars. هذا يمنع أن يكسر تعديلٌ في المجالات أرشيفَ تقارير قديمة.

---

## 2 · المكدّس

```
Laravel 13 · PHP 8.5 · MySQL 8
Inertia 2 · React 19 · TypeScript (strict) · Vite
```

**بلا Tailwind للواجهة العامة.** ملف `style.css` الحالي (~١٣٠٠ سطر) مُعايَر
يدوياً: خصائص منطقية RTL كاملة، لوحة ألوان مقفلة، وتباين مُدقَّق آلياً بصفر
إخفاق على ١٠٥٢ عقدة نصّية في ثلاث لغات. إعادة كتابته إلى Tailwind تُهدر هذا
كلّه وتخاطر بكسر AA. **ينتقل كما هو** إلى `resources/css/`.

Tailwind يُستعمل **داخل لوحة التحكم وحدها** — واجهة إدارية جديدة لا تاريخ لها.

> انحراف مقصود عن معيار المشروع (React+TS+**Tailwind**). السبب أعلاه.

---

## 3 · مشكلة الأرشفة والمشاركة — وحلّها

Inertia يرسم في المتصفّح. ثلاث نتائج:

1. **Google** ينفّذ الجافاسكربت ويفهرس — لا مشكلة حقيقية.
2. **زاحفات المعاينة** (واتساب، فيسبوك، تيليجرام، إكس) **لا تنفّذ
   الجافاسكربت**. بلا علاج تصبح كل رابط يُشارَك بلا صورة ولا عنوان. ولأن
   قناة التوزيع الأولى لتجمّع كهذا هي واتساب وفيسبوك، فهذا **ضرر ملموس لا
   نظري**.
3. أول رسم أبطأ من الثابت.

**الحل بلا SSR:** وسوم `<meta>` و`og:` تُرسَم **في قالب Blade الجذر**
(`app.blade.php`) من بيانات يمرّرها الـController لكل مسار. Inertia جذره
Blade أصلاً، فهذه ليست حيلة بل استعمال صحيح له.

```php
// HomeController
return Inertia::render('Home', $props)
    ->withViewData(['meta' => $this->meta($site)]);
```

**SSR الكامل يُؤجَّل** كتحسين اختياري، ويتوقّف على الاستضافة (القسم ١١) —
لا على الصحّة.

---

## 4 · هيكل المجلدات

### الخادم

```
app/
├── Contracts/
│   ├── PillarCatalog.php          ← سطح Pillars العام لبقية الوحدات
│   ├── MediaStore.php             ← رفع/قصّ/تحويل أبيض وأسود
│   └── ContentImporter.php        ← مُستورِد data.js (مرحلي)
├── Modules/
│   ├── Identity/   { Models/ Services/ Http/{Controllers,Requests} }
│   ├── Partners/
│   ├── Pillars/    { …  PillarCatalogService.php يحقّق العقد }
│   ├── Reports/
│   └── Media/
├── Localization/
│   ├── Models/Translation.php
│   ├── Services/TranslationResolver.php    ← يدمج العربية + طبقة اللغة
│   └── Concerns/HasTranslations.php        ← trait على كل نموذج مترجَم
├── Http/Middleware/SetLocale.php
└── Providers/AppServiceProvider.php        ← ربط العقود

resources/
├── js/
│   ├── pages/        Home.tsx · Pillar.tsx · Reports.tsx · Report.tsx · About.tsx · NotFound.tsx
│   │                 admin/… (مرآة لمسارات اللوحة)
│   ├── features/     identity/ partners/ pillars/ reports/ media/ translations/
│   │                 كل واحدة: components/ hooks/ types.ts
│   ├── components/   المشترك الحقيقي فقط: Band · Plate · Seal · Mark · Slot · StatStrip
│   ├── hooks/        useHeroSlider.ts · useSmoothWheel.ts · useReveal.ts
│   ├── lib/          nums.ts (تنسيق الأرقام) · locale.ts · meta.ts
│   └── app/          Layout.tsx · SiteHeader.tsx · SiteFooter.tsx
├── css/
│   ├── style.css            ← ينتقل كما هو، بلا تعديل
│   └── admin.css            ← Tailwind، للوحة وحدها
└── views/app.blade.php      ← الجذر: وسوم meta/og مرسومة خادمياً
```

**قاعدة feature-sliced:** الكود يبدأ داخل وحدته، ولا ينتقل إلى
`components/` المشتركة إلا بعد أن تحتاجه وحدة **ثانية** فعلاً.

### ما ينتقل كما هو (لا يُعاد كتابته)

| من | إلى |
|---|---|
| `assets/css/style.css` | `resources/css/style.css` — حرفياً |
| منطق سلايدر الافتتاحية | `hooks/useHeroSlider.ts` — المنطق نفسه، لا تصميم جديد |
| منطق تنعيم التمرير | `hooks/useSmoothWheel.ts` |
| `band/plate/seal/mark/slot` | مكوّنات React بنفس الـclasses |
| كل الصور | `storage/app/public/photos/` + رابط رمزي |

---

## 5 · قاعدة البيانات

### القرار الحرج: الأرقام نصوص

```sql
value VARCHAR(64)   -- "12,013,597" كما كُتبت. لا INT ولا DECIMAL.
```

معيار المشروع يقول «المال DECIMAL». **هنا ينطبق العكس عمداً**: هذه ليست
أرقاماً تُحسَب، بل **أرقام منشورة تُستنسخ حرفياً**. القاعدة الملزمة في هذا
المشروع «لا أرقام مشتقّة» — لا جمع، لا نِسَب، لا تقريب، و`12,013,597` لا
تصير `12M` أبداً. تخزينها عدداً يفتح الباب لإعادة تنسيقها، فتُخزَّن نصاً،
وحقلها في اللوحة نصّ حرّ لا يلمسه أي مُنسّق.

### الجداول — 18 هجرة، كما كُتبت فعلاً

```
media                 path, disk, mime, width, height, bytes, is_bw,
                      uploaded_by→users            UNIQUE(path)
                      ↑ التعليق ليس هنا: الصورة قد تُستعمل مرّتين بتعليقين

site_settings         صفّ واحد: name, short_name, tagline,
                      logo_full_media_id, logo_mark_media_id,
                      vision, mission, founding_year, media_office,
                      governance NULL, contact_* NULL, social JSON,
                      donate_url NULL, donate_qr_media_id NULL, donate_label,
                      home_metrics_count

content_lines         group ENUM(value|story|goal|aspiration|intro),
                      term NULL, body, position
                      ↑ جدول واحد لخمس قوائم متطابقة البنية

partners              slug, name, logo_media_id NULL, site_url NULL,
                      role NULL, about NULL, position, is_published
pillars               slug, num, title, short, orgs, definition NULL,
                      cover_media_id NULL, cover_caption NULL,
                      position, is_published
field_photos          media_id, position            UNIQUE(media_id)

reports               slug, label, range, report_title,
                      report_file_media_id NULL, metrics_title,
                      reading_title, data_notes_title, opportunities_title,
                      closing_title, closing_signoff,
                      appeal_title, appeal_lead,
                      appeal_photo_media_id, appeal_photo_caption,
                      status ENUM(draft|published), published_at, is_current

report_lines          report_id, group ENUM(notice|intro|highlight|reading|
                      data_note|opportunity|closing_paragraph|appeal_item),
                      term NULL, body, is_recap, position
                      ↑ ثمانية استعمالات متطابقة في جدول واحد

report_metrics        report_id, value VARCHAR(64), prefix NULL, unit NULL,
                      label, accent, position
report_sections       report_id, pillar_id, lead NULL, position
                      UNIQUE(report_id, pillar_id)
report_groups         report_section_id, num NULL, title NULL,
                      is_recap, position
report_group_items    report_group_id, term NULL, body, is_recap, position
report_blocks         report_section_id, title, note_term NULL,
                      note_body NULL, position
report_block_figures  report_block_id, value VARCHAR(64), prefix NULL,
                      unit NULL, label, accent, position
report_tables         report_id, report_section_id NULL, title NULL,
                      head JSON, rows JSON, foot JSON NULL,
                      foot_note NULL, position
report_gallery_items  report_section_id, media_id, caption, position

translations          translatable_type, translatable_id, field,
                      locale ENUM(en|tr), value,
                      status ENUM(machine|pending|approved),
                      translated_by NULL, reviewed_by NULL, reviewed_at NULL
                      UNIQUE(type, id, field, locale) · INDEX(locale, status)

users                 + role ENUM(admin|editor|translator)
```

**فُحص ساكناً** (لم تُشغَّل، ولم تُمسّ MySQL):

- صياغة PHP سليمة في الملفات الـ18 كلها.
- كل جدول مرجعي يُنشأ **قبل** الجدول الذي يشير إليه — رُوجعت السلسلة
  كاملة بترتيب الطوابع الزمنية.
- أطول اسم فهرس يولّده Laravel: 53 حرفاً — دون حدّ MySQL (64).
- عمودا `value` كلاهما `VARCHAR` لا `DECIMAL`، كما يوجب قرار الحرفية.
- كل عمود مفتاح أجنبي مفهرس (`constrained()` يفهرس تلقائياً).
- كل `down()` عكسيّ وقابل للتراجع.

### ثلاثة قرارات في هذه الجداول تستحق التبرير

**١ · `report_tables` تخزّن الصفوف JSON** — إلغاء تطبيع مقصود. الجدول
يُحرَّر ويُعرض وحدةً واحدة، ولا يُستعلَم عن خليّة فيه أبداً. تطبيعه إلى
صفوف وخلايا يضاعف الجداول بلا مكسب ويُعقّد محرّر الشبكة في اللوحة.
وJSON يحفظ النصّ حرفياً كما يحفظه عمود نصّي.

**٢ · `report_block_figures` جدول مستقلّ لا علاقة polymorphic** رغم
تطابق بنيته مع `report_metrics`. السبب: المفتاح الأجنبي هنا حقيقي
ومقيَّد في القاعدة، وعلاقة متعدّدة الأشكال تُسقط هذا القيد. واستعمالان
لا يبرّران التجريد (قاعدة الثلاث) — تكرار ستة أعمدة أرخص من تجريد خاطئ.

**٣ · `is_current` بلا قيد في المخطط.** «صفّ واحد فقط بقيمة true» لا
يُعبَّر عنه في MySQL إلا بحيلة. يُفرَض في الخدمة داخل معاملة، والفهرس
هنا للقراءة لا للقيد.

### لماذا جدول ترجمات لا أعمدة JSON

العربية تُخزَّن في **الأعمدة الأساسية**، و`translations` لا تقبل `ar` أصلاً
(مقيَّدة بـ`en|tr`). هذا يجعل قاعدة «العربية هي الأصل ولا تُترجَم» **قيداً
في المخطط لا عرفاً**. وثلاث فوائد تتبع:

1. حالة اعتماد **لكل حقل ولكل لغة** — وهي بالضبط ما يحتاجه وسم «غير معتمدة».
2. مَن ترجم ومَن راجع ومتى.
3. طابور «بانتظار الاعتماد» استعلامٌ واحد لا مسح لكل الصفوف.

الحجم ~٣٠٠ نصّ × لغتين = ~٦٠٠ صفّ. تُحمَّل كلها بـ`with()` واحد للّغة
النشطة. لا N+1.

---

## 6 · المسارات

### العامة

```
GET  /                       HomeController
GET  /p/{pillar:slug}        PillarController        ← بدل pillar.html?id=
GET  /reports                ReportArchiveController
GET  /reports/{report:slug}  ReportController
GET  /about                  AboutController
     ?lang=ar|en|tr  →  SetLocale middleware
```

مسارات حقيقية بدل `?id=` — مكسب أرشفة، وبلا كلفة: لا روابط منشورة بعد.

### اللوحة

```
/admin/login
/admin                       الحالة: ما ينقص · ما ينتظر اعتماداً · آخر نشاط
/admin/identity              الهوية والرؤية والرسالة والتواصل والتبرع
/admin/lines/{group}         قوائم مرتَّبة: أهداف · تطلعات · قيم · قصة · تمهيد
/admin/partners              + /{id}/edit
/admin/pillars               + /{id}/edit
/admin/reports               الأرشيف، وتعيين «الحالي»
/admin/reports/{id}/edit     المحرّر: أقسام ← مجموعات ← بنود
/admin/media                 المكتبة: رفع، قصّ، تحويل أبيض وأسود
/admin/translations          طابور الاعتماد (لغة × حالة)
/admin/users
```

مسار الطلب في كل كتابة، بلا استثناء:

```
Route → Controller (≤15 سطراً) → FormRequest → Service → Model
                                        ↘ Event → Listeners
```

---

## 7 · لوحة التحكم — ما يجعلها لهذا المشروع لا لأي مشروع

أربع ميزات تترجم قواعد الموقع القائمة إلى أدوات:

### أ · لوحة «ما ينقص»

الموقع اليوم يرسم الحقول `null` **خانات محجوزة موسومة** لا يُخترع لها بديل.
اللوحة تقلب هذا إلى قائمة عمل حيّة. ما ينقص الآن فعلاً:

**٤١ خانة محجوزة**، أحصاها المُصدِّر آلياً (`node tools/export-content.mjs`):

| الحقل | العدد | الأثر |
|---|---|---|
| `pillars[].definition` | **٥ من ٧** | خمسة مجالات عمل بلا نصّ تعريفي في صفحتها الداخلية |
| `partners[].role` · `.about` · `.site` | ٧ × ٣ = ٢١ | كل شريك بلا دور ولا نبذة ولا رابط |
| `contact.*` + `social.*` | ٨ | لا بريد ولا هاتف ولا عنوان ولا حساب واحد |
| `donors.donateUrl` · `donateQr` | ٢ | زرّ التبرع بلا وجهة |
| `reports[].reportFile` | ٢ | لا PDF لأيّ من التقريرين |
| `pillars[6].cover` | ١ | **«الرعاية الصحية» بلا غلاف، فلا شريحة له في السلايدر** |
| `partners[6].logo` | ١ | شعار مركز الحمد مفقود |
| `governance` | ١ | الحوكمة واتخاذ القرار |

> `pillars[].definition` الخمسة لم تكن معروفة قبل التصدير. **أخطر بند في
> القائمة**: صفحة المجال الداخلية تقوم على هذا النصّ.

### ب · طابور اعتماد الترجمة

النصّ العربي والمقترَح جنباً إلى جنب، وزرّ اعتماد لكل حقل. **وسم «ترجمة غير
معتمدة» في أعلى الموقع يختفي تلقائياً** حين تُعتمَد كل حقول تلك اللغة — لا
بتبديل يدوي.

### ج · حارس الحرفية

- حقول الأرقام نصّ حرّ، ولا مُنسّق يلمسها — لا فواصل تُضاف ولا اختصار.
- تحذير ظاهر عند الحفظ إن تغيّر رقم منشور في تقرير **منشور**.
- `activity_log` يحفظ القيمة قبل وبعد لكل تعديل، فالاسترجاع ممكن دائماً.

### د · معاينة حيّة

`/admin/preview/{route}?draft=1` يرسم الصفحة العامة ببيانات المسوّدة. Inertia
يجعلها شبه مجانية: نفس مكوّن الصفحة، مصدر بيانات مختلف.

---

## 8 · الترحيل — والتحقّق منه

```
١. ContentImporter يقرأ data.js (Node → JSON → Seeder) ويملأ القاعدة.
   لا كتابة يدوية لأي نصّ. ولا حرف يُطبَع من جديد.
٢. العربية → الأعمدة الأساسية.
   en.js و tr.js → translations بحالة machine (غير معتمدة).
٣. المدقّق يُعاد تشغيله على ناتج الصفحات المرسومة
   من القاعدة. أي نصّ لا ينجو = الترحيل فاشل، لا يُكمَل.
٤. مدقّق التباين يُعاد تشغيله على المسارات الستة × ثلاث لغات.
٥. data.js يبقى في المستودع بعلامة "مرجع أصل" للمقارنة، لا يُحذف.
```

---

## 9 · المراحل

| # | ما يُسلَّم | ينتهي بـ |
|---|---|---|
| **أ** ✅ | هيكلة Laravel 13 + Inertia 2 + React 19 + TS، نقل CSS والصور، الصفحات الستّ تقرأ من **JSON ثابت** (نقل حرفي لـ`data.js`) | **تمّت** — انظر القسم ١٣ |
| **ب** | المخطط + الترحيل + النماذج والعقود، الصفحات تقرأ من MySQL | المدقّقان يمرّان **ثانيةً** على ناتج القاعدة |
| **ج** | المصادقة والصلاحيات وسجل النشاط | دخول يعمل، ثلاثة أدوار |
| **د** | اللوحة: الهوية، القوائم، الشركاء، المجالات، المكتبة | تحرير كامل لكل ما عدا التقارير |
| **هـ** | محرّر التقارير + الأرشيف | إنشاء تقرير ربعي جديد بلا كود |
| **و** | طابور الترجمة والاعتماد + المعاينة الحيّة | الوسم يختفي بالاعتماد |

**فصل «أ» عن «ب» مقصود**: يفصل تحقّق الواجهة عن تحقّق البيانات. لو دُمجا
وسقط نصّ، لن تعرف أمِن الترحيل أم من إعادة الرسم.

---

## 10 · المخاطر

| الخطر | الاحتمال | التخفيف |
|---|---|---|
| سقوط نصّ في الترحيل | متوسط | المدقّق بوّابة إلزامية في المرحلتين أ وب |
| كسر معاينة الروابط المشاركة | **عالٍ بلا علاج** | وسوم meta خادمية في قالب Blade الجذر (القسم ٣) |
| انحدار RTL في مكوّنات React | متوسط | CSS ينتقل كما هو؛ فحص الاتجاهات الثلاثة في كل شاشة |
| ضياع معايرة التباين | منخفض | المدقّق الآلي يُعاد تشغيله بوّابةً في كل مرحلة |
| محرّر بشري يُفسد رقماً منشوراً | متوسط | حارس الحرفية + `activity_log` + تحذير على المنشور |
| الاستضافة لا تدعم PHP/MySQL | **يحجب كل شيء** | يُحسَم قبل المرحلة أ |

---

## 11 · عائق المسار العربي — مشخَّص ومحلول

`php artisan serve` **لا يعمل من مسار المشروع الحالي**. السبب مؤكَّد لا مُخمَّن:

```
Failed opening required 'D:\ظ…ظˆظ‚ط¹ ظ…طھط­ط¯ظˆظ†iles\...'
```

«موقع متحدون» وصلت إلى العملية الفرعية مشوّهة — بايتات UTF‑8 قُرئت بترميز
ويندوز‑1256. `artisan serve` يولّد عملية `php -S` ويمرّر إليها المسار كوسيط،
وويندوز يُرمّز وسائط العمليات بصفحة الترميز المحلية التي لا تمثّل العربية.

ما جُرّب وما ثبت:

| المحاولة | النتيجة |
|---|---|
| PHP CLI وComposer في المسار نفسه | **يعملان** — `realpath` و`glob` و`scandir` كلها سليمة |
| `php artisan serve` | ✗ يفشل — تشويه وسيط العملية الفرعية |
| وصلة junction من `C:\mtdapp2` | ✗ لا تنفع — PHP يحلّ المسار إلى الأصل العربي |
| `php -S` مباشرة بموجّه خاص | **يعمل** — لا توليد عملية فرعية، فالمسار سليم |

الحلّ المطبَّق: `motahidoon-app/serve.php` — موجّه صغير للخادم المدمج،
موثَّق داخله بسببه. يُشغَّل عبر `.claude/launch.json` باسم `motahidoon-app`:

```
php -S 127.0.0.1:8130 -t motahidoon-app/public motahidoon-app/serve.php
```

**المشكلة محلّية التطوير وحدها.** مسار الإنتاج على cPanel لاتيني فلا تظهر
أصلاً. لكن مسار عربي بمسافات يبقى خصماً لمشروع PHP — فإن ظهرت أعراض أخرى
في أدوات لاحقة، فنقل المشروع إلى مسار لاتيني هو الحلّ الجذري.

---

## 12 · ما يلزم حسمه قبل البدء

1. **الاستضافة**: مشتركة (cPanel/LiteSpeed) أم VPS؟ تحدّد SSR وعمّال الطوابير
   ومعالجة الصور — لا تحدّد الهيكلية.
2. **MySQL غير مثبّت على هذا الجهاز** — XAMPP أو Laragon للتطوير المحلي.
3. **من يحرّر؟** عدد المستخدمين وأدوارهم يحدّد عمق نظام الصلاحيات.

---

_البيئة المتحقَّق منها: PHP 8.5.0 · Composer 2.8.11 · Node 22.12.0 · npm 10.9.0 · Git 2.51_


---

## 13 · نتيجة المرحلة أ

### بوّابة سلامة النصوص

المقارنة **بالموقع الأصلي** لا بملف المحتوى: بعض نصوص `data.js` لا تُعرض
في أي صفحة أصلاً، فمقارنتها بالملف وحده تعطي «مفقوداً» ليس نقصاً.

| | مفحوص | غير معروض | بصمة SHA-256 |
|---|---|---|---|
| الموقع الثابت الأصلي | 521 | 93 | `6e47f8d382e1089a4f8fa80770804fc5` |
| Laravel + Inertia | 521 | 93 | `6e47f8d382e1089a4f8fa80770804fc5` |

**تطابق تامّ.** مجموعة النصوص المرسومة واحدة، لا نصّ سقط ولا نصّ زاد.

**التباين:** 2784 عقدة نصّية على 21 تركيبة (7 مسارات × 3 لغات) — **صفر إخفاق**.

### مَزلقان في المدقّق صُحّحا — يُحفظان لئلا يتكرّرا

1. **وصل العقد النصّية بفاصل** يكسر المطابقة: نصّ يقطعه `<em>` أو
   `<span class="num">` يصير جزأين فيُحسَب مفقوداً. الوصل الصحيح بلا فاصل.
2. **`document.body.textContent` يشمل نصّ `<script>`.** وInertia 2 يضع
   حمولة الصفحة في وسم script داخل `body` — 145 ألف حرف. فكان المدقّق
   يقرأ الحمولة نفسها ويمرّ كاذباً. تُستبعد `script` و`style` و`noscript`
   صراحةً. (بعد التصحيح نزل حجم النصّ المجمّع من 540 ألفاً إلى 53 ألفاً،
   والنتيجة لم تتغيّر — لكن الفحص صار موثوقاً.)

### ثغرة قائمة في الأصل، كشفها المدقّق

الـ93 نصّاً غير المعروض كلها **بنود مجموعات تقرير الربع الثاني**. السبب
بنيوي ومتعمّد في التصميم الأصلي: صفحة المجال تعرض أحدث تقرير يذكره فقط،
وصفحة التقرير تعرض موجزاً لا تفصيلاً. فتفصيل أي تقرير سابق لا طريق إليه.

ليست من الترحيل، ولا تُحسم بالكود: تُحسم في لوحة التحكم — صفحة تقرير
كاملة لكل فترة، أو رابط «التفصيل الكامل» من الموجز.

### ما بُني

**الخادم:** عقد `ContentSource` ← `JsonContentSource` · `LocalizeContent`
(نقل حرفي، بقواعده المانعة لخلط اللغات) · `SiteContent` · `BuildMeta`
(وسوم og: خادمية) · `SetLocale` · `HandleInertiaRequests` · خمسة
Controllers · معالج 404 يرسم صفحة الموقع.

**الواجهة:** `Layout` · `SiteHeader` · `SiteFooter` · `Hero` بالسلايدر ·
`primitives` (Band · Slot · Seal · Mark · Fact · Statement · FigureCell ·
StatStrip · Plate) · `Icon` **مولَّد آلياً من app.js** لا منسوخ يدوياً ·
`features/home/sections` · `features/report/parts` · خمس صفحات ·
خطّافات `useSmoothWheel` و`useHeroSlider` و`useReveal` و`useDocumentChrome`.

**الأدوات:** `tools/export-content.mjs` (يُقيّم `data.js` في سياق معزول،
لا تعبير نمطي) · `tools/verify-strings.js` (البوّابة).

### ما لم يُنقل عمداً

- **طبقة خطوط «ثمانية»**: الخطّ الآن Zain + IBM Plex Sans Arabic كالأصل.
  لم تُنقل لأنها غير مرخَّصة للنشر أصلاً، ونقلها إلى مشروع سيُنشر يوسّع
  الخطر. تُضاف بطلب إن أُريدت المطابقة البصرية أثناء التطوير.
- **`laravel/boost`**: سقالة Laravel 13 تطلب تثبيته في `CLAUDE.md`
  الخاص بها. لم يُثبَّت — معايير المشروع توجب الوقوف قبل أي تبعية، وملف
  سقالة لا يلغي ذلك.
