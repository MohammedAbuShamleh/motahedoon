/* أقسام الصفحة الرئيسية — نقل حرفي لـ renderHome() في app.js الثابت.
   الترتيب والأصناف ومواضع الخانات المحجوزة كما هي، فـstyle.css يسري
   بلا تعديل حرف. */

import { Link } from "@inertiajs/react";
import { Nums } from "@/lib/nums";
import { useSite, useU } from "@/lib/site";
import { Icon } from "@/components/Icon";
import {
  Band, Fact, FigureCell, Filled, Mark, Seal, Slot, Statement,
} from "@/components/primitives";
import type { Founding, Identity, Partner, Pillar, Report } from "@/types";

const ord = (i: number) => String(i).padStart(2, "0");

/** رابط يحافظ على اللغة الحالية. */
function usePath(): (p: string) => string {
  const { locale } = useSite();
  return (p) => (locale === "ar" ? p : `${p}?lang=${locale}`);
}

/* ---------- شريط المجالات تحت الافتتاحية ---------- */
export function AreasStrip({ pillars }: { pillars: Pillar[] }) {
  const U = useU();
  const path = usePath();
  return (
    <nav className="band band--flush band--noline areas" aria-label={U("مجالات العمل")}>
      <ul className="areas__row">
        {pillars.map((p) => (
          <li key={p.id}>
            <Link className="areas__a" href={path(`/p/${p.id}`)}>
              <Icon id={p.id} />
              <span>{p.short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- من نحن ---------- */
export function About({
  identity, founding, governance,
}: {
  identity: Identity;
  founding: Founding;
  governance: string | null;
}) {
  const U = useU();
  const path = usePath();
  return (
    <Band
      id="about"
      main={
        <>
          <h2 className="h-sec">{U("من نحن")}</h2>
          <div className="prose body-lg" style={{ marginTop: "1.75rem" }}>
            {founding.story.slice(0, 1).map((p) => (
              <p key={p}><Nums text={p} /></p>
            ))}
          </div>

          <div className="statements">
            <Statement label={U("الرؤية")} value={identity.vision} />
            <Statement label={U("الرسالة")} value={identity.mission} />
          </div>

          <p style={{ marginTop: "clamp(1.75rem,3vw,2.5rem)" }}>
            <Link className="btn btn--ghost" href={path("/about")}>
              {U("التعريف الكامل")}
            </Link>
          </p>
        </>
      }
      aside={
        <>
          <Mark n={ord(1)} label={U("من نحن")} />
          {founding.year
            ? <div className="facts"><Fact value={founding.year} label={U("سنة التأسيس")} /></div>
            : <Slot label={U("سنة التأسيس")} />}
          <div style={{ marginTop: "1.5rem" }}>
            {governance
              ? <Filled label={U("الحوكمة واتخاذ القرار")} value={governance} />
              : <Slot label={U("الحوكمة واتخاذ القرار")} />}
          </div>
        </>
      }
    />
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
          <div className="partners__grid stagger">
            {partners.map((p) => (
              <article className="partner" key={p.id}>
                <span className="partner__logo">
                  {p.logo
                    ? <img src={`/${p.logo}`} alt={p.name} loading="lazy" />
                    : <span className="partner__nologo">{U("شعار قيد الاستلام")}</span>}
                </span>
                <h3 className="partner__n">
                  {p.site
                    ? <a href={p.site} target="_blank" rel="noopener">{p.name}</a>
                    : p.name}
                </h3>
                {(p.role || p.about) && (
                  <p className="partner__meta">{p.role || p.about}</p>
                )}
              </article>
            ))}
          </div>
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
  return (
    <Band
      id="fields"
      main={
        <>
          <h2 className="h-sec">{U("مجالات العمل")}</h2>
          <ol className="fields stagger">
            {pillars.map((p) => (
              <li className="field" key={p.id}>
                <Link className="field__link" href={path(`/p/${p.id}`)}>
                  <span className="field__node" aria-hidden="true">
                    <span className="field__n">{p.num}</span>
                  </span>
                  <span className="field__head">
                    <Icon id={p.id} />
                    <span className="field__t">{p.title}</span>
                  </span>
                  <span className="field__o">{p.orgs}</span>
                  <span className="field__go">{U("تفاصيل المجال")}</span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      }
      aside={
        <>
          <Mark n={ord(3)} label={U("مجالات العمل")} />
          <div className="facts">
            <Fact value={String(pillars.length)} label={U("مجالات دائمة")} />
          </div>
        </>
      }
    />
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
   القسم الوحيد المؤرَّخ في الرئيسية، ويحمل ختمه. */
export function Impact({ report, count }: { report: Report; count: number }) {
  const U = useU();
  const path = usePath();
  return (
    <Band
      id="impact"
      main={
        <>
          <h2 className="h-sec">{U("لمحة أثر")}</h2>
          <div className="figs figs--tiles stagger">
            {report.metrics.slice(0, count).map((m, i) => (
              <FigureCell m={m} key={`${m.label}-${i}`} />
            ))}
          </div>
          <p style={{ marginTop: "clamp(2rem,4vw,3rem)" }}>
            <Link className="btn btn--ghost" href={path("/reports")}>
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
