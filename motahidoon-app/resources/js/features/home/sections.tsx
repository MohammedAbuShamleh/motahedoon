/* أقسام الصفحة الرئيسية — نقل حرفي لـ renderHome() في app.js الثابت.
   الترتيب والأصناف ومواضع الخانات المحجوزة كما هي، فـstyle.css يسري
   بلا تعديل حرف. */

import { Link } from "@inertiajs/react";
import { Nums } from "@/lib/nums";
import { useSite, useU } from "@/lib/site";
import { Icon } from "@/components/Icon";
import {
  Fact, Filled, Seal, Section, SectionHead, Slot, Statement,
} from "@/components/primitives";
import type { Founding, Identity, Partner, Pillar, Report } from "@/types";

const ord = (i: number) => String(i).padStart(2, "0");

/** رابط يحافظ على اللغة الحالية. */
function usePath(): (p: string) => string {
  const { locale } = useSite();
  return (p) => (locale === "ar" ? p : `${p}?lang=${locale}`);
}

/* ---------- شريط المجالات تحت الافتتاحية ----------
   شريط رسمي ثابت على الحبري: عنوان صغير في الوسط، ثم أعمدة متساوية بينها
   شعرات رأسية — الرقم، فالرمز، فالاسم المختصر. كلّ عمود رابط لصفحة مجاله.
   عدد الأعمدة من عدد المجالات (--n) — لا عدد مفترَض، ولا حركة تُفرض. */
export function AreasStrip({ pillars }: { pillars: Pillar[] }) {
  const U = useU();
  const path = usePath();
  return (
    <nav
      className="band band--flush band--noline areas"
      aria-label={U("مجالات العمل")}
      style={{ "--n": pillars.length } as React.CSSProperties}
    >
      <div className="areas__in reveal">
        <p className="areas__label" aria-hidden="true">{U("مجالات العمل")}</p>
        {/* خطّ أفقي تتدلّى منه البطاقات: لكل بند قطعة من الخطّ وعقدة وساق،
            والقطع تلتحم عبر الفراغات فتبدو خطّاً واحداً */}
        <ul className="areas__grid">
          {pillars.map((p, i) => (
            <li key={p.id} style={{ "--i": i } as React.CSSProperties}>
              <span className="areas__axis" aria-hidden="true"><i /></span>
              <Link className="areas__a" href={path(`/p/${p.id}`)}>
                <span className="areas__top">
                  <span className="areas__badge"><Icon id={p.id} /></span>
                  <small className="areas__n">{p.num}</small>
                </span>
                <span className="areas__name">{p.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/* ---------- من نحن ----------
   عمودان: النصّ من جهة بدء السطر، وصورة ميدانية في دائرة من جهة نهايته.
   المحتوى كما كان حرفاً بحرف (العنوان، فقرة التأسيس، الرؤية والرسالة،
   سنة التأسيس، خانة الحوكمة، رابط التعريف الكامل) — التغيير في التخطيط وحده.
   بلا صورة لا عمود للصورة: التخطيط مشتقّ من البيانات لا مفترَض. */
export function About({
  identity, founding, governance, photo,
}: {
  identity: Identity;
  founding: Founding;
  governance: string | null;
  photo: string | null;
}) {
  const U = useU();
  const path = usePath();
  return (
    <section className={photo ? "band about" : "band about about--solo"} id="about">
      <div className="about__in reveal">
        <div className="about__text">
          <h2 className="h-sec about__title">{U("من نحن")}</h2>
          {/* شعرة حمراء تنتهي بالنقطة المعيّنية — من استعمالات الأحمر المعدودة */}
          <span className="about__rule" aria-hidden="true" />

          <div className="prose body-lg about__lead">
            {founding.story.slice(0, 1).map((p) => (
              <p key={p}><Nums text={p} /></p>
            ))}
          </div>

          <div className="statements about__statements">
            <Statement label={U("الرؤية")} value={identity.vision} />
            <Statement label={U("الرسالة")} value={identity.mission} />
          </div>

          <div className="about__meta">
            {founding.year
              ? <div className="facts"><Fact value={founding.year} label={U("سنة التأسيس")} /></div>
              : <Slot label={U("سنة التأسيس")} />}
            {/* الحوكمة: في الرئيسية تظهر حين تُعتمد وحدها — خانتها المحجوزة
                تبقى في صفحة «التعريف الكامل» (قرار صاحب المشروع، استثناءً من
                قاعدة «الحقل الفارغ يظهر ولا يُخفى» في هذا الموضع فقط). */}
            {governance && <Filled label={U("الحوكمة واتخاذ القرار")} value={governance} />}
          </div>

          <p className="about__cta">
            <Link className="btn btn--ghost" href={path("/about")}>
              {U("التعريف الكامل")}
            </Link>
          </p>
        </div>

        {photo && (
          <figure className="about__media" aria-hidden="true">
            <span className="about__dots" />
            <span className="about__ring" />
            <img src={`/${photo}`} alt="" loading="lazy" decoding="async" width={560} height={560} />
          </figure>
        )}
      </div>
    </section>
  );
}

/* ---------- المؤسسات الشريكة ---------- */
export function Partners({ partners }: { partners: Partner[] }) {
  const U = useU();
  const allBare = partners.every((p) => !p.role && !p.about);
  return (
    <Section
      id="partners"
      head={
        <SectionHead
          title={U("المؤسسات الشريكة")}
          side={
            <>
              {allBare && <Slot label={U("نبذة كل مؤسسة")} />}
              <Fact value={String(partners.length)} label={U("مؤسسة في المظلة")} />
            </>
          }
        />
      }
    >
      {/* شبكة رسمية: خانات ورقية متساوية بشعرات مشتركة — الشعار في
          مساحة ثابتة الارتفاع، وتحته الاسم ثم الصفة إن وُجدت. عدد
          الأعمدة يتبع العرض، لا عدداً مفترَضاً من الشركاء. */}
      <ul className="pgrid">
        {partners.map((p) => (
          <li key={p.id} className="pgrid__cell">
            <span className="pgrid__logo">
              {p.logo
                ? <img src={`/${p.logo}`} alt={p.name} loading="lazy" />
                : <span className="partner__nologo">{U("شعار قيد الاستلام")}</span>}
            </span>
            <h3 className="pgrid__n">
              {p.site
                ? <a href={p.site} target="_blank" rel="noopener">{p.name}</a>
                : p.name}
            </h3>
            {(p.role || p.about) && (
              <p className="pgrid__meta">{p.role || p.about}</p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- مجالات العمل ---------- */
export function Fields({ pillars }: { pillars: Pillar[] }) {
  const U = useU();
  const path = usePath();
  /* خطّ زمني أفقي: البنود تتناوب فوق الخطّ وتحته — النصّ في جهة والصورة
     الدائرية في الأخرى. المجال بلا غلاف تحمل دائرته رمزه، لا صورة بديلة
     (الفجوة تُسدّ من اللوحة لا هنا). عدد الأعمدة مشتقّ من البيانات. */
  return (
    <section className="band sec ftl-band" id="fields">
      <div className="sec__in reveal">
        <SectionHead
          title={U("مجالات العمل")}
          side={<Fact value={String(pillars.length)} label={U("مجالات دائمة")} />}
        />
      </div>

      <div className="ftl reveal">
        <ol className="ftl__row" style={{ "--n": pillars.length } as React.CSSProperties}>
          {pillars.map((p, i) => (
            <li
              /* التناوب مزدوج: الموضع (فوق/تحت الخطّ) واللون (بطاقة حبرية/ورقية) */
              className={i % 2 ? "ftl__i is-down" : "ftl__i is-up is-ink"}
              key={p.id}
              style={{ "--i": i } as React.CSSProperties}
            >
              <Link className="ftl__a" href={path(`/p/${p.id}`)}>
                <span className="ftl__text">
                  <span className="ftl__card">
                    <span className="ftl__n">{p.num}</span>
                    <span className="ftl__t">{p.title}</span>
                    <span className="ftl__o">{p.orgs}</span>
                  </span>
                </span>
                {/* المحور: قطعة الخطّ في هذا العمود وعقدته؛ القطع تلتحم عبر
                    الفراغات فتبدو خطّاً واحداً، وتُرسم تباعاً */}
                <span className="ftl__axis" aria-hidden="true"><span className="ftl__dot" /></span>
                <span className="ftl__media" aria-hidden="true">
                  {p.cover?.src
                    ? <img src={`/${p.cover.src}`} alt="" loading="lazy" decoding="async" />
                    : <Icon id={p.id} />}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* «من الميدان» صار معرضاً في Gallery.tsx (FieldGallery). */

/* ---------- لمحة أثر ----------
   القسم الوحيد المؤرَّخ في الرئيسية، ويحمل ختمه. قسم داكن ببطاقة لكلّ
   مؤشّر: رقم ترتيب محفور في ركنها، والقيمة كما كُتبت حرفياً (لا جمع ولا
   تقريب)، ثم التسمية. عدد البطاقات من عدد المؤشّرات المختارة (--n). */
export function Impact({ report, count }: { report: Report; count: number }) {
  const U = useU();
  const path = usePath();
  const metrics = report.metrics.slice(0, count);
  /* شريط أرقام رسمي على الحبري: العنوان في الوسط وتحته ختم الفترة (كل
     رقم مؤرَّخ يحمل فترته — حدّ أحمر)، ثم أعمدة متساوية بينها شعرات
     رأسية: الترتيب، فالقيمة كما هي حرفياً، فوحدتها، فالتسمية. */
  return (
    <section className="band band--dark impact" id="impact">
      <div className="impact__in reveal">
        <header className="impact__head">
          <h2 className="h-sec impact__title">{U("لمحة أثر")}</h2>
          <Seal value={report.label} />
        </header>

        <ol className="impact__cols" style={{ "--n": metrics.length } as React.CSSProperties}>
          {metrics.map((m, i) => {
            const shown = (m.prefix ? `${m.prefix} ` : "") + m.value;
            return (
              <li
                key={`${m.label}-${i}`}
                className="impact__col"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="impact__no" aria-hidden="true">{ord(i + 1)}</span>
                <p className="impact__v"><bdi>{shown}</bdi></p>
                {m.unit ? <p className="impact__u">{m.unit}</p> : null}
                <p className="impact__l">{m.label}</p>
              </li>
            );
          })}
        </ol>

        <p className="impact__cta">
          <Link className="btn btn--light" href={path("/reports")}>
            {U("الإنجازات الكاملة")}
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ---------- التقارير: أرشيف، والحالي أحدث عناصره ---------- */
export interface ReportCard {
  id: string; label: string; range: string; reportTitle: string;
}

export function Reports({
  reports, reportFile,
}: {
  reports: ReportCard[];
  reportFile: string | null;
}) {
  const U = useU();
  const path = usePath();
  const { org } = useSite();
  const [cur, ...rest] = reports;
  return (
    <Section
      id="reports"
      head={
        <SectionHead
          title={U("التقارير")}
          side={
            <>
              {reportFile
                ? <a className="btn btn--ghost" href={`/${reportFile}`}>{U("ملف PDF")}</a>
                : <Slot label={U("ملف التقرير PDF")} />}
              <Fact value={String(reports.length)} label={U("تقارير منشورة")} />
              {/* رابط الأرشيف — تسمية واجهة قائمة ومترجمة، لا نصّ جديد */}
              <Link className="shead__more" href={path("/reports")}>{U("الإنجازات الكاملة")}</Link>
            </>
          }
        />
      }
    >
      {/* الأحدث: بطاقة إصدار — غلاف وثيقة مرسوم (من بيانات التقرير وحدها:
          شعار التجمع واسمه المختصر والفترة) مائلاً على لوح زيتوني، وبجانبه
          الوسم والعنوان والمدى والإجراءات. الأسطر الرمادية زخرفة لا نصّ. */}
      {cur && (
        <article className="rfeat">
          <div className="rfeat__cover" aria-hidden="true">
            <span className="rfeat__stack">
              <span className="rfeat__sheet">
                <span className="rfeat__band">
                  <img src={`/${org.logoMark}`} alt="" />
                  <span>{org.shortName}</span>
                </span>
                <span className="rfeat__period">{cur.label}</span>
                <span className="rfeat__lines"><i /><i /><i /><i /><i /></span>
              </span>
            </span>
          </div>
          <div className="rfeat__body">
            <p className="rfeat__k">
              <span className="rfeat__badge">{U("أحدث تقرير")}</span>
              {cur.label}
            </p>
            <h3 className="rfeat__t">{cur.reportTitle}</h3>
            <p className="rfeat__r">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
              {cur.range}
            </p>
            <div className="rfeat__actions">
              <Link className="btn rfeat__go" href={path(`/reports/${cur.id}`)}>{U("عرض الإنجازات")}</Link>
              {reportFile && <a className="btn btn--ghost" href={`/${reportFile}`}>{U("ملف PDF")}</a>}
            </div>
          </div>
        </article>
      )}

      {/* الأرشيف: سجلّ صفوف بأعمدة ثابتة — الفترة، العنوان، المدى، الرابط */}
      {rest.length > 0 && (
        <ol className="rlog">
          {rest.map((r) => (
            <li key={r.id}>
              <Link className="rlog__a" href={path(`/reports/${r.id}`)}>
                <span className="rlog__ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
                </span>
                <span className="rlog__k">{r.label}</span>
                <span className="rlog__t">{r.reportTitle}</span>
                <span className="rlog__r">{r.range}</span>
                <span className="rlog__go">{U("عرض الإنجازات")}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

/* ---------- الدعم والتواصل ----------
   لوح واحد بنصفين: التواصل ورقياً (البريد والهاتف والعنوان صفوفاً بمربّعات
   زيتونية)، والدعم حبرياً (رابط الدعم، وكود QR في إطار بزوايا كإطار المسح).
   الحقل الفارغ يظهر خانة محجوزة ولا يُخفى ولا يُملأ ببديل. */
function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <li className="sup__row">
      <span className="sup__ico" aria-hidden="true">{icon}</span>
      {value ? <Filled label={label} value={value} /> : <Slot label={label} />}
    </li>
  );
}

export function Support() {
  const U = useU();
  const { donors: d, contact: c } = useSite();
  return (
    <Section id="support" head={<SectionHead title={U("الدعم والتواصل")} />}>
      <div className="sup">
        <section className="sup__reach" aria-label={U("التواصل")}>
          <ul className="sup__list">
            <ContactRow icon={<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>} label={U("البريد")} value={c.email} />
            <ContactRow icon={<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>} label={U("الهاتف")} value={c.phone} />
            <ContactRow icon={<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>} label={U("العنوان")} value={c.address} />
          </ul>
        </section>

        <section className="sup__give" aria-label={U("رابط الدعم")}>
          <div className="sup__donate">
            <span className="sup__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
            </span>
            {d.donateUrl
              ? <a className="btn btn--light" href={d.donateUrl} target="_blank" rel="noopener">{d.donateLabel}</a>
              : <Slot label={U("رابط الدعم")} />}
          </div>
          <figure className="sup__qr">
            <span className="sup__frame">
              {d.donateQr
                ? <img src={`/${d.donateQr}`} alt={U("كود QR للدعم")} />
                : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM18 18h3v3h-3zM18 14h3M14 18v3" />
                  </svg>
                )}
            </span>
            {!d.donateQr && <figcaption><Slot label={U("كود QR")} /></figcaption>}
          </figure>
        </section>
      </div>
    </Section>
  );
}
