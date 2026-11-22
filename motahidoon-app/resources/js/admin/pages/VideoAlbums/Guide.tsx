import { Head } from "@inertiajs/react";
import type { ReactNode } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, LinkButton, PageHeader } from "../../components/ui";

/* دليل مكتبة الفيديو: خطوات إنشاء ألبوم وإضافة مقاطعه، وأين يظهر كلّ شيء
   في الموقع، وما يحسن معرفته قبل الرفع. صفحة شرح وحدها — لا نموذج فيها. */

function Step({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink text-sm font-black text-paper">{n}</span>
      <div className="min-w-0 flex-1 pt-1">
        <h3 className="font-bold">{title}</h3>
        {children && <div className="mt-1.5 space-y-1.5 text-sm leading-7 text-ink/75">{children}</div>}
      </div>
    </li>
  );
}

export default function Guide({ maxMb }: { maxMb: number }) {
  return (
    <AdminLayout>
      <Head title="دليل مكتبة الفيديو" />
      <PageHeader
        title="دليل مكتبة الفيديو"
        subtitle="كيف تنشئ ألبوماً وتضيف إليه المقاطع، وأين يظهر ذلك في الموقع."
        actions={
          <>
            <LinkButton href="/admin/video-albums">رجوع إلى المكتبة</LinkButton>
            <LinkButton href="/admin/video-albums/create" variant="primary">+ ألبوم جديد</LinkButton>
          </>
        }
      />

      <div className="space-y-6">
        <Card title="الفكرة في سطرين">
          <p className="text-sm leading-7 text-ink/75">
            المكتبة <b>ألبومات</b>، وفي كلّ ألبوم <b>مقاطع</b>. المقطع إمّا <b>رابط</b> من يوتيوب أو فيسبوك، وإمّا <b>ملف</b> فيديو
            ترفعه من جهازك. الألبوم لا يظهر في الموقع حتى يضمّ مقطعاً واحداً منشوراً على الأقل.
          </p>
        </Card>

        <Card title="إنشاء ألبوم">
          <ol className="space-y-5">
            <Step n={1} title="افتح «مكتبة الفيديو» من القائمة، ثم «+ ألبوم جديد»">
              <p>القائمة الجانبية ← المحتوى الثابت ← مكتبة الفيديو.</p>
            </Step>
            <Step n={2} title="اكتب اسم الألبوم والمعرّف في الرابط">
              <p><b>الاسم</b> كما يراه الزائر، مثل: «حملة رمضان 2026».</p>
              <p><b>المعرّف</b> حروف إنجليزية صغيرة وشرطات، مثل <span dir="ltr" className="font-bold">ramadan-2026</span> — فيصير رابط الألبوم <span dir="ltr">/videos/ramadan-2026</span>.</p>
            </Step>
            <Step n={3} title="أضف ما تشاء من الاختياري">
              <p><b>الوصف</b>: سطر أو سطران يظهران في صفحة الألبوم.</p>
              <p><b>مجال العمل</b>: لربط الألبوم بأحد المجالات.</p>
              <p><b>الغلاف</b>: بدونه يُستعمل غلاف أوّل مقطع. يظهر كاملاً بنسبته دون قصّ.</p>
              <p><b>الترتيب</b>: رقم موضعه بين الألبومات؛ اتركه فارغاً ليكون آخرها.</p>
            </Step>
            <Step n={4} title="احفظ — تنتقل مباشرة إلى صفحة الألبوم لتضيف مقاطعه" />
          </ol>
        </Card>

        <Card title="إضافة مقطع إلى الألبوم">
          <ol className="space-y-5">
            <Step n={1} title="في صفحة الألبوم، اضغط «+ إضافة مقطع»" />
            <Step n={2} title="اختر المصدر">
              <p><b>رابط يوتيوب أو فيسبوك</b> (الأنسب غالباً): انسخ رابط المقطع من المتصفّح والصقه. يوتيوب العادي وShorts كلاهما مقبول، وغلاف يوتيوب يُجلب تلقائياً.</p>
              <p><b>ملف مرفوع</b>: MP4 أو WebM أو MOV حتى <b>{maxMb} ميغابايت</b>. يظهر شريط نسبة الرفع أثناء الإرسال — لا تغلق الصفحة حتى يكتمل.</p>
            </Step>
            <Step n={3} title="اكتب العنوان، وأكمل الاختياري">
              <p><b>الوصف</b> يظهر تحت المشغّل.</p>
              <p><b>المدّة</b> تُكتب كما تُقرأ: <span dir="ltr">4:12</span> أو <span dir="ltr">1:04:12</span>.</p>
              <p><b>تاريخ التصوير</b> يحدّد «الأحدث» في الرئيسية.</p>
              <p><b>صورة الغلاف</b>: يُستحسن لمقاطع فيسبوك والملفات؛ يوتيوب يكفيه غلافه.</p>
            </Step>
            <Step n={4} title="«مميّز في قسم الرئيسية» إن أردت أن يتقدّم القائمة هناك" />
            <Step n={5} title="احفظ — يعود بك إلى الألبوم، وتظهر المقاطع فيه مرتّبة" />
          </ol>
        </Card>

        <Card title="أين يظهر ذلك في الموقع">
          <ul className="list-disc space-y-1.5 ps-5 text-sm leading-7 text-ink/75">
            <li><b>الصفحة الرئيسية</b>: قسم «مكتبة الفيديو» قبل «المؤسسات الشريكة» — ستّة مقاطع على الأكثر: المميّزة أوّلاً ثم الأحدث، بمشغّل كبير وقائمة بجانبه.</li>
            <li><b>صفحة المكتبة</b> <span dir="ltr">/videos</span>: كلّ الألبومات، ثم أحدث المقاطع.</li>
            <li><b>صفحة كلّ ألبوم</b> <span dir="ltr">/videos/المعرّف</span>: مقاطع الألبوم كلّها، ثم الألبومات الأخرى.</li>
          </ul>
        </Card>

        <Card title="قبل أن تبدأ — نصائح">
          <ul className="list-disc space-y-1.5 ps-5 text-sm leading-7 text-ink/75">
            <li><b>الترجمة</b>: في الصفحتين الإنجليزية والتركية لا يظهر الألبوم أو المقطع إلا إن تُرجم <b>عنوانه</b> (في بطاقة الترجمة أسفل كلّ نموذج). بلا ترجمة يظهر في العربية وحدها.</li>
            <li><b>المقاطع الطويلة</b>: ارفعها على يوتيوب وضع رابطها — أخفّ على الخادم وعلى الزائرين ذوي الاتصال الضعيف.</li>
            <li><b>الإخفاء دون حذف</b>: ألغِ «ظاهر في الموقع» لألبوم أو مقطع لتخفيه مؤقتاً.</li>
            <li><b>الحذف</b>: حذف الألبوم يحذف مقاطعه كلّها نهائياً، والملفات المرفوعة التي لم تعد مستعملة تُحذف من الخادم.</li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
}
