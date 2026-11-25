import { Link, usePage } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { useSite, useU } from "@/lib/site";

/* صفحة الخطأ بلغة الموقع: 404 و403 و419 و429 و500 و503.
   ورقة بعمودين: الرمز كبيراً مفرَّغاً بخطّ الختم الأحمر تحته، ثم العنوان
   والشرح والإجراءات؛ وفي الجانب لوح «روابط قد تفيدك» مرقّم بالزيتوني.
   زوايا مربّعة، بلا دوائر، والأخضر للإجراء وحده. لا تُعدّ في الإحصاءات:
   روابط الخطأ اعتباطية ولا تمثّل صفحة. */

type Status = 403 | 404 | 419 | 429 | 500 | 503;

/* تسميات واجهة فقط (لا نصّ تعريفي): العنوان والشرح لكلّ رمز */
const COPY: Record<Status, { title: string; text: string }> = {
  404: { title: "هذه الصفحة غير موجودة", text: "الرابط لا يطابق أي مجال عمل ولا أي تقرير في الموقع." },
  403: { title: "لا تملك صلاحية الوصول إلى هذه الصفحة", text: "هذه الصفحة غير متاحة لك." },
  419: { title: "انتهت صلاحية الصفحة", text: "مرّ وقت طويل منذ فتح الصفحة. حدّثها ثم أعد المحاولة." },
  429: { title: "طلبات كثيرة في وقت قصير", text: "انتظر دقيقة ثم أعد المحاولة." },
  500: { title: "حدث خطأ غير متوقّع", text: "تعذّر عرض هذه الصفحة الآن. حاول مرة أخرى بعد قليل." },
  503: { title: "الموقع قيد الصيانة", text: "نعمل على تحديث الموقع، وسيعود خلال وقت قصير." },
};

export default function ErrorPage(props: { status?: Status; pillars?: { id: string; short: string }[] }) {
  /* بلا الخصائص المشتركة (خادم بشيفرة قديمة يرسل الصفحة خارج وسيط Inertia):
     لا ترويسة ولا تذييل يمكن رسمهما — تُرسم الصفحة مستقلّة بالعربية */
  const shared = usePage<{ ui?: Record<string, string> }>().props;
  return shared.ui ? <SitePage {...props} /> : <BarePage status={props.status ?? 404} />;
}

function SitePage({ status = 404, pillars = [] }: { status?: Status; pillars?: { id: string; short: string }[] }) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);
  const copy = COPY[status] ?? COPY[500];
  // ما يُصلَح بإعادة المحاولة: زرّ التحديث بدل «الرجوع»
  const retry = status === 419 || status === 429 || status === 500 || status === 503;

  const links = [
    { href: "/", label: U("الصفحة الرئيسية") },
    { href: "/about", label: U("من نحن") },
    { href: "/reports", label: U("الإنجازات") },
    { href: "/videos", label: U("مكتبة الفيديو") },
  ];

  return (
    <Layout track={false}>
      <section className="band err" aria-labelledby="err-t">
        <div className="err__in">
          <div className="err__main">
            <p className="err__k">{U("خطأ")} <span dir="ltr">{status}</span></p>
            <p className="err__code" aria-hidden="true" dir="ltr">{status}</p>
            <h1 className="h-page err__t" id="err-t">{U(copy.title)}</h1>
            <p className="lead err__p">{U(copy.text)}</p>
            <div className="err__actions">
              <Link className="btn btn--green" href={path("/")}>{U("العودة إلى الرئيسية")}</Link>
              {retry
                ? <button type="button" className="btn btn--ghost" onClick={() => window.location.reload()}>{U("تحديث الصفحة")}</button>
                : <button type="button" className="btn btn--ghost" onClick={() => window.history.back()}>{U("الرجوع للصفحة السابقة")}</button>}
            </div>
          </div>

          <nav className="err__aside" aria-label={U("روابط قد تفيدك")}>
            <p className="err__ah">{U("روابط قد تفيدك")}</p>
            <ol className="err__list">
              {links.map((l, i) => (
                <li key={l.href}>
                  <Link href={path(l.href)}>
                    <span className="err__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ol>
            {pillars.length > 0 && (
              <>
                <p className="err__ah err__ah--sub">{U("مجالات العمل")}</p>
                <ul className="err__tags">
                  {pillars.map((p) => (
                    <li key={p.id}><Link href={path(`/p/${p.id}`)}>{p.short}</Link></li>
                  ))}
                </ul>
              </>
            )}
          </nav>
        </div>
      </section>
    </Layout>
  );
}

/* الصفحة المستقلّة: الشعار واسم التجمّع ثم الرمز والعنوان والإجراءات —
   بأصناف .err نفسها، بلا Layout (لا خطّافات تقرأ الخصائص الغائبة). */
function BarePage({ status }: { status: Status }) {
  const copy = COPY[status] ?? COPY[500];
  const retry = status === 419 || status === 429 || status === 500 || status === 503;
  return (
    <div dir="rtl" lang="ar" className="err-bare">
      <header className="err-bare__head">
        <img src="/assets/img/logos/mutahidoon-mark.png" alt="" width={36} height={36} />
        <b>تجمع متحدون من أجل غزة</b>
      </header>
      <main id="main">
        <section className="band err" aria-labelledby="err-t">
          <div className="err__in err__in--solo">
            <div className="err__main">
              <p className="err__k">خطأ <span dir="ltr">{status}</span></p>
              <p className="err__code" aria-hidden="true" dir="ltr">{status}</p>
              <h1 className="h-page err__t" id="err-t">{copy.title}</h1>
              <p className="lead err__p">{copy.text}</p>
              <div className="err__actions">
                <a className="btn btn--green" href="/">العودة إلى الرئيسية</a>
                <button type="button" className="btn btn--ghost"
                  onClick={() => (retry ? window.location.reload() : window.history.back())}>
                  {retry ? "تحديث الصفحة" : "الرجوع للصفحة السابقة"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
