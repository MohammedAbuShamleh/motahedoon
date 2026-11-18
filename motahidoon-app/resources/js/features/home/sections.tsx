/* أقسام الصفحة الرئيسية — نقل حرفي لـ renderHome() في app.js الثابت.
   الترتيب والأصناف ومواضع الخانات المحجوزة كما هي، فـstyle.css يسري
   بلا تعديل حرف. */

import { Link } from "@inertiajs/react";
import { Nums } from "@/lib/nums";
import { useSite, useU } from "@/lib/site";
import { Icon } from "@/components/Icon";
import {
  Band, Fact, Filled, Mark, Seal, Slot, Statement,
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
          <Mark n={ord(1)} label={U("من نحن")} />
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
            {governance
              ? <Filled label={U("الحوكمة واتخاذ القرار")} value={governance} />
              : <Slot label={U("الحوكمة واتخاذ القرار")} />}
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
    <Band
      id="partners"
      main={
        <>
          <h2 className="h-sec">{U("المؤسسات الشريكة")}</h2>
          {/* مسار أفقي: دوائر الشعارات على خطّ واحد، وتحت كلّ دائرة رقمها
              وبطاقة اسمها. عدد الأعمدة من عدد الشركاء (--n) — لا عدد مفترَض. */}
          <ol className="ptl" style={{ "--n": partners.length } as React.CSSProperties}>
            <li className="ptl__line" aria-hidden="true" />
            {partners.map((p, i) => (
              <li key={p.id} className="ptl__item" style={{ "--i": i } as React.CSSProperties}>
                <span className="ptl__logo">
                  {p.logo
                    ? <img src={`/${p.logo}`} alt={p.name} loading="lazy" />
                    : <span className="partner__nologo">{U("شعار قيد الاستلام")}</span>}
                </span>
                <span className="ptl__stem" aria-hidden="true" />
                <span className="ptl__no" aria-hidden="true">{ord(i + 1)}</span>
                <article className="ptl__card">
                  <h3 className="partner__n">
                    {p.site
                      ? <a href={p.site} target="_blank" rel="noopener">{p.name}</a>
                      : p.name}
                  </h3>
                  {(p.role || p.about) && (
                    <p className="partner__meta">{p.role || p.about}</p>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </>
      }
      aside={
        <>
          <Mark n={ord(2)} label={U("المؤسسات الشريكة")} />
          <div className="facts">
            <Fact value={String(partners.length)} label={U("مؤسسة في المظلة")} />
          </div>
          {allBare && (
            <div style={{ marginTop: "1.5rem" }}>
              <Slot label={U("نبذة كل مؤسسة")} />
            </div>
          )}
        </>
      }
    />
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
    <section className="band ftl-band" id="fields">
      <div className="sheet reveal">
        <div className="sheet__main">
          <h2 className="h-sec">{U("مجالات العمل")}</h2>
        </div>
        <aside className="sheet__aside">
          <Mark n={ord(3)} label={U("مجالات العمل")} />
          <div className="facts">
            <Fact value={String(pillars.length)} label={U("مجالات دائمة")} />
          </div>
        </aside>
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

/* ---------- من الميدان ----------
   صور كبيرة، تمرير أفقي، بلا تعليق لكل صورة — لا يُخترع وصف ولا يُذكر
   موقع. حاوية تمرير يمكن بلوغها بلوحة المفاتيح، ومرنة لأي عدد. */
export function Filmstrip({ photos }: { photos: string[] }) {
  const U = useU();
  if (!photos.length) return null;
  return (
    <section className="band band--tight film" id="field">
      <div className="sheet">
        <div className="sheet__main">
          <h2 className="h-sec">{U("من الميدان")}</h2>
        </div>
        <aside className="sheet__aside">
          <Mark label={U("توثيق")} />
          <div className="facts">
            <Fact value={String(photos.length)} label={U("صور معتمدة")} />
          </div>
        </aside>
      </div>
      <div className="film__strip" tabIndex={0} role="group" aria-label={U("من الميدان")}>
        {photos.map((src) => (
          <figure className="film__f" key={src}>
            <img src={`/${src}`} alt={U("من التوثيق الميداني للتجمع")} loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ---------- لمحة أثر ----------
   القسم الوحيد المؤرَّخ في الرئيسية، ويحمل ختمه. قسم داكن ببطاقة لكلّ
   مؤشّر: رقم ترتيب محفور في ركنها، والقيمة كما كُتبت حرفياً (لا جمع ولا
   تقريب)، ثم التسمية. عدد البطاقات من عدد المؤشّرات المختارة (--n). */
export function Impact({ report, count }: { report: Report; count: number }) {
  const U = useU();
  const path = usePath();
  const metrics = report.metrics.slice(0, count);
  return (
    <Band
      id="impact"
      cls="band--dark impact"
      main={
        <>
          <h2 className="h-sec impact__title"><span>{U("لمحة أثر")}</span></h2>
          <ol className="impact__cols" style={{ "--n": metrics.length } as React.CSSProperties}>
            {metrics.map((m, i) => {
              const shown = (m.prefix ? `${m.prefix} ` : "") + m.value;
              return (
                <li
                  key={`${m.label}-${i}`}
                  className={m.accent ? "impact__col is-accent" : "impact__col"}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="impact__no" aria-hidden="true">{ord(i + 1)}</span>
                  <p className="impact__v">
                    <bdi>{shown}</bdi>
                    {m.unit ? <span className="impact__u">{m.unit}</span> : null}
                  </p>
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
        </>
      }
      aside={<><Mark n={ord(4)} label={U("لمحة أثر")} /><Seal value={report.label} /></>}
    />
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
  return (
    <Band
      id="reports"
      main={
        <>
          <h2 className="h-sec">{U("التقارير")}</h2>
          <div className="reports stagger">
            {reports.map((r, i) => (
              <article className={i === 0 ? "report report--current" : "report"} key={r.id}>
                <div>
                  <p className="report__k">
                    {i === 0 ? `${U("أحدث تقرير")} · ` : ""}{r.label}
                  </p>
                  <h3 className="report__t">{r.reportTitle}</h3>
                  <p className="report__r">{r.range}</p>
                </div>
                <Link className="btn btn--ghost" href={path(`/reports/${r.id}`)}>
                  {U("عرض الإنجازات")}
                </Link>
              </article>
            ))}
          </div>
        </>
      }
      aside={
        <>
          <Mark n={ord(5)} label={U("التقارير")} />
          <div className="facts">
            <Fact value={String(reports.length)} label={U("تقارير منشورة")} />
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            {reportFile
              ? <p><a className="btn btn--ghost" href={`/${reportFile}`}>{U("ملف PDF")}</a></p>
              : <Slot label={U("ملف التقرير PDF")} />}
          </div>
        </>
      }
    />
  );
}

/* ---------- الدعم والتواصل ---------- */
export function Support() {
  const U = useU();
  const { donors: d, contact: c } = useSite();
  return (
    <Band
      id="support"
      main={
        <>
          <h2 className="h-sec">{U("الدعم والتواصل")}</h2>
          <div className="slots--row" style={{ marginTop: "clamp(2rem,4vw,3rem)" }}>
            {d.donateUrl
              ? <p><a className="btn btn--green" href={d.donateUrl} target="_blank" rel="noopener">{d.donateLabel}</a></p>
              : <Slot label={U("رابط الدعم")} />}
            {d.donateQr
              ? <figure><img src={`/${d.donateQr}`} alt={U("كود QR للدعم")} /></figure>
              : <Slot label={U("كود QR")} />}
          </div>
        </>
      }
      aside={
        <>
          <Mark n={ord(6)} label={U("الدعم والتواصل")} />
          {c.email ? <Filled label={U("البريد")} value={c.email} /> : <Slot label={U("البريد")} />}
          {c.phone ? <Filled label={U("الهاتف")} value={c.phone} /> : <Slot label={U("الهاتف")} />}
          {c.address ? <Filled label={U("العنوان")} value={c.address} /> : <Slot label={U("العنوان")} />}
        </>
      }
    />
  );
}
