/* أقسام الصفحة الرئيسية — نقل حرفي لـ renderHome() في app.js الثابت.
   الترتيب والأصناف ومواضع الخانات المحجوزة كما هي، فـstyle.css يسري
   بلا تعديل حرف. */

import { useLayoutEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import { useCardCycle } from "@/hooks/useCardCycle";
import { Nums } from "@/lib/nums";
import { useSite, useU } from "@/lib/site";
import { Icon } from "@/components/Icon";
import {
  Fact, FigureCell, Filled, Seal, Section, SectionHead, Slot,
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
/* بند الرؤية أو الرسالة: مربّع أخضر برمزه، ثم الوسم والنصّ. الفارغ خانة
   محجوزة موسومة — لا يُخفى ولا يُبدَّل. */
function VmItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="vm">
      <span className="vm__ico" aria-hidden="true">{icon}</span>
      {value
        ? (
          <div className="vm__txt">
            <p className="vm__k">{label}</p>
            <p className="vm__v"><Nums text={value} /></p>
          </div>
        )
        : <Slot label={label} />}
    </div>
  );
}

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

          <div className="prose body-lg about__lead">
            {founding.story.slice(0, 1).map((p) => (
              <p key={p}><Nums text={p} /></p>
            ))}
          </div>

          <div className="about__vm">
            <VmItem
              label={U("الرؤية")}
              value={identity.vision}
              icon={<svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><path d="M12 9l3 3-3 3-3-3z" /></svg>}
            />
            <VmItem
              label={U("الرسالة")}
              value={identity.mission}
              icon={<svg viewBox="0 0 24 24"><path d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12zM12 6.5l5.5 5.5-5.5 5.5L6.5 12zM12 10.4l1.6 1.6-1.6 1.6-1.6-1.6z" /></svg>}
            />
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

        {/* الصورة بهيئة فصول صفحة التقرير (rp-ch__media): إطار أخضر مفرَّغ
            يبرز نحو حافّة الصفحة ومربّع زيتوني مفرَّغ نحو المتن */}
        {photo && (
          <div className="rp-ch__media about__media" aria-hidden="true">
            <figure className="rp-ch__fig">
              <img src={`/${photo}`} alt="" loading="lazy" decoding="async" width={640} height={480} />
            </figure>
          </div>
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
/* بطاقات منقسمة: الصورة في جهة بدء السطر والنصّ في جهة نهايته. أربع ظاهرة
   متتالية بترتيب القراءة، وكل خمس ثوانٍ تتقدّم النافذة بطاقتين
   (useCardCycle): يخرج الصفّ الأول، ويصعد الثاني إلى مكانه بانزلاق هادئ،
   ويدخل مجالان جديدان تحته — فالمعروض والنقاط مرتّبان دائماً. يتوقّف الدوران
   تحت المؤشّر والتركيز، ومع «تقليل الحركة» تُعرض المجالات كلّها ثابتة. المجال
   بلا غلاف لوحٌ برمزه — لا صورة بديلة (الفجوة تُسدّ من اللوحة). وللطباعة
   شبكة بالمجالات كلّها. */
const FIELD_SLOTS = 4;
const FIELD_STEP = 2;
const FIELD_TICK = 5000;

function FieldCard({ p, href, more }: { p: Pillar; href: string; more: string }) {
  return (
    <Link className="fcard" href={href}>
      <span className="fcard__media" aria-hidden="true">
        {p.cover?.src
          ? <img src={`/${p.cover.src}`} alt="" loading="lazy" decoding="async" />
          : <span className="fcard__panel"><Icon id={p.id} /></span>}
        <span className="fcard__n">{p.num}</span>
      </span>
      <span className="fcard__body">
        <span className="fcard__ico" aria-hidden="true"><Icon id={p.id} /></span>
        <span className="fcard__t">{p.title}</span>
        <span className="fcard__o">{p.orgs}</span>
        <span className="fcard__go">{more}</span>
      </span>
    </Link>
  );
}

export function Fields({ pillars }: { pillars: Pillar[] }) {
  const U = useU();
  const path = usePath();
  const listRef = useRef<HTMLUListElement>(null);
  /* مواضع البطاقات قُبيل التقدّم — لتحريك الباقية من مكانها القديم (FLIP) */
  const prevPos = useRef<Map<string, { x: number; y: number }> | null>(null);
  const { shown, start, pos, cycle, rotates, calm, hold } = useCardCycle(pillars.length, FIELD_SLOTS, {
    step: FIELD_STEP,
    tick: FIELD_TICK,
    onBeforeStep: () => {
      const ul = listRef.current;
      if (!ul) return;
      prevPos.current = new Map(
        Array.from(ul.children as HTMLCollectionOf<HTMLElement>, (el) => [
          el.dataset.id ?? "", { x: el.offsetLeft, y: el.offsetTop },
        ]),
      );
    },
  });
  const live = calm ? pillars.map((_, i) => i) : shown;
  const more = U("تفاصيل المجال");

  /* البطاقتان الباقيتان تنزلقان من موضعهما القديم إلى الجديد، والخارجتان
     تُزالان. الجديدتان تنتظران حتى يخلو مكانهما من المنزلقتين ثم تظهران —
     وإلا عبرت المنزلقتان فوقهما لحظةَ دخولهما */
  useLayoutEffect(() => {
    const prev = prevPos.current;
    prevPos.current = null;
    const ul = listRef.current;
    if (!prev || !ul) return;
    for (const el of Array.from(ul.children as HTMLCollectionOf<HTMLElement>)) {
      const p = prev.get(el.dataset.id ?? "");
      if (!p) {
        el.animate(
          [{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }],
          { duration: 800, easing: "ease-out" },
        );
        continue;
      }
      const dx = p.x - el.offsetLeft;
      const dy = p.y - el.offsetTop;
      if (dx || dy) {
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
          { duration: 700, easing: "cubic-bezier(.22,.61,.36,1)" },
        );
      }
    }
  }, [start]);

  return (
    <section className="band sec fields-band" id="fields">
      <div className="sec__in reveal">
        <SectionHead
          title={U("مجالات العمل")}
          side={<Fact value={String(pillars.length)} label={U("مجالات دائمة")} />}
        />

        <div
          className="fcards-wrap"
          onPointerEnter={() => hold(true)}
          onPointerLeave={() => hold(false)}
          onFocus={() => hold(true)}
          onBlur={() => hold(false)}
        >
          <ul className="fcards fcards--live" ref={listRef}>
            {live.map((idx) => {
              const p = pillars[idx];
              return (
                /* المفتاح هو المجال وحده: البطاقة الباقية تحتفظ بعنصرها فتنزلق،
                   والجديدة وحدها تُركَّب فتجري حركة دخولها */
                <li key={p.id} data-id={p.id} className="fcards__slot">
                  <FieldCard p={p} href={path(`/p/${p.id}`)} more={more} />
                </li>
              );
            })}
          </ul>

          {/* مؤشّر ترقيم: نقطة لكل خطوة من الدورة، والمضاءة تتقدّم واحدةً
              واحدةً باتجاه القراءة — لا تنقسم على طرفي الصفّ حين تلتفّ النافذة */}
          {rotates && (
            <p className="fcards__dots" aria-hidden="true">
              {Array.from({ length: cycle }, (_, k) => <i key={k} className={k === pos ? "is-on" : undefined} />)}
            </p>
          )}

          {/* للطباعة: المجالات كلّها — مخفية على الشاشة فلا تُقرأ ولا تُبلَغ بالتبويب */}
          <ul className="fcards fcards--print" aria-hidden="true">
            {pillars.map((p) => (
              <li key={p.id} className="fcards__slot">
                <FieldCard p={p} href={path(`/p/${p.id}`)} more={more} />
              </li>
            ))}
          </ul>
        </div>
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
  const lead = metrics.filter((m) => m.accent);
  const rest = metrics.filter((m) => !m.accent);
  /* شريحة الأرقام بلغة صفحة التقرير (rp-kpi): ختم الفترة في الرأس (كل رقم
     مؤرَّخ يحمل فترته)، ثم المؤشّر الموسوم accent يتصدّر، ثم بطاقات مرقّمة.
     القيم كما هي حرفياً — FigureCell لا يحسب ولا يختصر. */
  return (
    <section className="band band--dark rp-kpi impact" id="impact">
      <div className="rp-sec__in reveal">
        <header className="rp-sec__head">
          <h2 className="h-sec">{U("لمحة أثر")}</h2>
          <Seal value={report.label} />
        </header>

        {lead.length > 0 && (
          <div className="rp-kpi__lead">
            <div className="rp-kpi__figs">
              {lead.map((m, i) => <FigureCell m={m} key={`${m.label}-${i}`} />)}
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="rp-kpi__grid stagger rp-stag">
            {rest.map((m, i) => (
              <div className="rp-kpi__card" key={`${m.label}-${i}`}>
                <span className="rp-kpi__no" aria-hidden="true">{ord(i + 1)}</span>
                <FigureCell m={m} />
              </div>
            ))}
          </div>
        )}

        <p className="impact__cta">
          <Link className="btn btn--light" href={path("/reports")}>
            {U("الإنجازات الكاملة")}
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ---------- التقارير: فهرس الإصدارات ----------
   لوح واحد بنصفين بلغة شرائح العروض المؤسسية:
   · الأحدث على الورق — غلاف وثيقة مرسوم (من بيانات التقرير وحدها: شعار
     التجمع واسمه المختصر والفترة) فوق ورقة زيتونية مائلة، وبجانبه الوسم
     والعنوان والمدى وملفّ PDF والإجراء.
   · الفهرس على الحبري — كلّ الإصدارات مرقّمة (01، 02…) كصفحة «الفهرس»،
     وعددها كبيراً في رأسه، والأحدث موسوم بشريط أخضر.
   لا عدد مفترض: الفهرس يطول بطول الأرشيف. الأسطر الرمادية زخرفة لا نصّ. */
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
  const cur = reports[0];
  return (
    <Section id="reports" head={<SectionHead title={U("التقارير")} />}>
      <div className="rhub">
        {cur && (
          <article className="rhub__feat">
            <div className="rhub__cover" aria-hidden="true">
              <span className="rhub__stack">
                <span className="rhub__sheet">
                  <span className="rhub__band">
                    <img src={`/${org.logoMark}`} alt="" />
                    <span>{org.shortName}</span>
                  </span>
                  <span className="rhub__period">{cur.label}</span>
                  <span className="rhub__lines"><i /><i /><i /><i /><i /></span>
                </span>
              </span>
            </div>
            <div className="rhub__body stagger">
              <p className="rhub__k">
                <span className="rhub__badge">{U("أحدث تقرير")}</span>
                {cur.label}
              </p>
              <h3 className="rhub__t">{cur.reportTitle}</h3>
              <p className="rhub__r">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
                {cur.range}
              </p>
              <div className="rhub__file">
                <span className="rhub__fico" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
                </span>
                {reportFile
                  ? <a className="btn btn--ghost" href={`/${reportFile}`}>{U("ملف PDF")}</a>
                  : <Slot label={U("ملف التقرير PDF")} />}
              </div>
              <div className="rhub__actions">
                <Link className="btn btn--green" href={path(`/reports/${cur.id}`)}>{U("عرض الإنجازات")}</Link>
              </div>
            </div>
          </article>
        )}

        <nav className="rhub__index" aria-label={U("تقارير منشورة")}>
          <p className="rhub__count">
            <b>{reports.length}</b>
            <span>{U("تقارير منشورة")}</span>
          </p>
          <ol className="rhub__list stagger">
            {reports.map((r, i) => (
              <li key={r.id}>
                <Link className={i === 0 ? "rhub__item is-cur" : "rhub__item"} href={path(`/reports/${r.id}`)}>
                  <span className="rhub__n" aria-hidden="true">{ord(i + 1)}</span>
                  <span className="rhub__ik">
                    {r.label}
                    {i === 0 && <span className="rhub__now">{U("أحدث تقرير")}</span>}
                  </span>
                  <span className="rhub__it">{r.reportTitle}</span>
                  <span className="rhub__ir">{r.range}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </Section>
  );
}

/* ---------- الدعم والتواصل ----------
   لوحان متجاوران بلغة شرائح العروض المؤسسية:
   · الدعم لوحاً أخضر في جهة البدء — رابط الدعم، ثم كود QR في إطار مسح
     بزوايا ورقية.
   · التواصل أشرطةً ورقية متتابعة — مربّع رمز زيتوني، وخطّ لون في جهة
     البدء يتبدّل أخضر · زيتوني · أحمر (الأحمر خطّاً لا مساحة).
   بلا دوائر: دبّوس العنوان نقطته معيّن الشعار لا دائرة.
   الحقل الفارغ يظهر خانة محجوزة ولا يُخفى ولا يُملأ ببديل. */
type Tone = "green" | "olive" | "red";

function ContactBar({ icon, label, value, tone }: {
  icon: React.ReactNode; label: string; value: string | null; tone: Tone;
}) {
  return (
    <li className={`shub__bar shub__bar--${tone}`}>
      <span className="shub__ico" aria-hidden="true">{icon}</span>
      {value ? <Filled label={label} value={value} /> : <Slot label={label} />}
    </li>
  );
}

export function Support() {
  const U = useU();
  const { donors: d, contact: c } = useSite();
  return (
    <Section id="support" head={<SectionHead title={U("الدعم والتواصل")} />}>
      <div className="shub">
        <section className="shub__give" aria-label={U("رابط الدعم")}>
          <div className="shub__donate">
            <span className="shub__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
            </span>
            {d.donateUrl
              ? <a className="btn btn--light" href={d.donateUrl} target="_blank" rel="noopener">{d.donateLabel}</a>
              : <Slot label={U("رابط الدعم")} />}
          </div>
          <figure className="shub__qr">
            <span className="shub__frame">
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

        <section className="shub__reach" aria-label={U("التواصل")}>
          <ul className="shub__list stagger">
            <ContactBar tone="green" label={U("البريد")} value={c.email}
              icon={<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>} />
            <ContactBar tone="olive" label={U("الهاتف")} value={c.phone}
              icon={<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>} />
            <ContactBar tone="red" label={U("العنوان")} value={c.address}
              icon={<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><path d="M12 6.4 14.6 9 12 11.6 9.4 9z" /></svg>} />
          </ul>
        </section>
      </div>
    </Section>
  );
}
