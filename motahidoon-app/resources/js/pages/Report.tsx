import { Link } from "@inertiajs/react";
import type { CSSProperties, ReactNode } from "react";
import { Layout } from "@/app/Layout";
import { Icon } from "@/components/Icon";
import { FigureCell, Plate, Seal, Slot } from "@/components/primitives";
import { ArOnly, SectionBrief, Table } from "@/features/report/parts";
import { Nums } from "@/lib/nums";
import { useSite, useU } from "@/lib/site";
import type { Cover, Entry, Report as R, TitledList } from "@/types";

interface PillarRef {
  id: string; num: string; title: string; short: string; orgs: string;
  cover: Cover | null;
}

interface Props {
  report: R;
  pillars: PillarRef[];
  others: { id: string; label: string; reportTitle: string }[];
}

/* =====================================================================
   صفحة التقرير بلغة العروض المؤسسية: شرائح متعاقبة — غلاف ببطاقة وثيقة،
   شريحة أرقام داكنة، مسار فصول، فصول منقسمة (صورة ومتن) تتبادل جهتها،
   ثم بطاقات وقوائم مرقّمة. النصّ كلّه من المصدر كما هو؛ الجديد هنا
   هندسة وحركة فقط.
   ===================================================================== */

/* ترقيم ترتيبي للواجهة (01، 02…): موضع البند في قائمته، لا رقم من المحتوى */
const ord = (i: number) => String(i + 1).padStart(2, "0");

/* متغيّر --i يقود تأخير الحركة لعنصر داخل مجموعة */
const at = (i: number) => ({ "--i": i }) as CSSProperties;

/* وسم الفترة المختصر: كلّ قسم مؤرَّخ يحمل فترته بصرياً (قاعدة الحاشية) */
function PeriodTag({ label }: { label: string }) {
  return <span className="rp-tag">{label}</span>;
}

/* قسم من أقسام التقرير: رأس موحّد (العنوان ووسم الفترة) ثم المحتوى */
function RpSection({ id, title, tag, cls, children }: {
  id: string; title: string; tag: string; cls?: string; children: ReactNode;
}) {
  return (
    <section className={`band rp-sec ${cls ?? ""}`} id={id}>
      <div className="rp-sec__in reveal">
        <header className="rp-sec__head">
          <h2 className="h-sec">{title}</h2>
          <PeriodTag label={tag} />
        </header>
        {children}
      </div>
    </section>
  );
}

/* قائمة مرقّمة بأربع هيئات:
   cards — بطاقات بشارة مربّعة تنقلب معيّناً عند المرور (القراءة، النداء)
   notes — لوح فاتح بعمودين وشارات مفرّغة (ملاحظات الضبط)
   steps — خطوات برقم كبير وسكّة تمتلئ (الفرص)
   brief — بطاقات على الحبري (أبرز الإنجازات في شريحة الأرقام)
   البند المعنون والنصّي كلاهما مقبول، فشكل المصدر لا يكسر الهيئة. */
type ListVariant = "cards" | "notes" | "steps" | "brief";

function ReportList({ items, variant }: { items: (Entry | string)[]; variant: ListVariant }) {
  const rows: Entry[] = items.map((it) => (typeof it === "string" ? { text: it } : it));
  return (
    <ol className={`rp-list rp-list--${variant} stagger rp-stag`}>
      {rows.map((it, i) => (
        <li className="rp-item" key={i}>
          <span className="rp-item__no" aria-hidden="true">{ord(i)}</span>
          <div className="rp-item__body">
            {it.term ? <h3 className="rp-item__term">{it.term}</h3> : null}
            <p className="rp-item__text"><Nums text={it.text} /></p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* خطوط مائلة تُرسم في شريط بطاقة الوثيقة — نقش الغلاف */
function CoverLines() {
  return (
    <svg className="rp-doc__lines" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice"
         aria-hidden="true" focusable="false">
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={i * 40 - 70} y1="130" x2={i * 40 + 50} y2="-10" style={at(i)} />
      ))}
    </svg>
  );
}

export default function Report({ report: rep, pillars, others }: Props) {
  const U = useU();
  const { locale, donors } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);

  const chapters = pillars.filter((p) => rep.sections?.[p.id]);

  /* المؤشّر الموسوم accent يتصدّر بجانب الحلقات؛ الهرمية من وسم المصدر */
  const leadMetrics = rep.metrics.filter((m) => m.accent);
  const restMetrics = rep.metrics.filter((m) => !m.accent);

  const ListBand = ({ id, obj, variant, cls }: {
    id: string; obj: TitledList | null; variant: ListVariant; cls?: string;
  }) =>
    obj?.items?.length ? (
      <RpSection id={id} title={obj.title} tag={rep.label} cls={cls}>
        <ReportList items={obj.items} variant={variant} />
      </RpSection>
    ) : null;

  /* محتويات التقرير: روابط داخل الصفحة إلى أقسامه — بعناوينها كما هي */
  const toc: { href: string; label: string; n?: string }[] = [
    { href: "#rp-metrics", label: rep.metricsTitle },
    ...chapters.map((p) => ({ href: `#rp-${p.id}`, label: p.short, n: p.num })),
    ...(rep.summary ? [{ href: "#rp-summary", label: rep.summary.title }] : []),
    ...(rep.reading?.items?.length ? [{ href: "#rp-reading", label: rep.reading.title }] : []),
    ...(rep.dataNotes?.items?.length ? [{ href: "#rp-notes", label: rep.dataNotes.title }] : []),
    ...(rep.opportunities?.items?.length ? [{ href: "#rp-opps", label: rep.opportunities.title }] : []),
    ...(rep.appeal?.title ? [{ href: "#rp-appeal", label: rep.appeal.title }] : []),
    ...(rep.closing ? [{ href: "#rp-closing", label: rep.closing.title }] : []),
  ];

  return (
    <Layout active="report">
      {/* الغلاف — شريحة العنوان: العنوان والمقدّمة في جهة، وبطاقة الوثيقة
          في الأخرى يحضنها لوح أخضر ومربّع زيتوني مفرَّغ */}
      <section className="band rp-cover">
        <div className="rp-cover__in">
          <div className="rp-cover__main">
            <p className="ph__kicker">{U("الإنجازات")}</p>
            <h1 className="h-page">{rep.reportTitle}</h1>
            <p className="lead rp-cover__range">{rep.range}</p>
            <div className="prose body-lg rp-cover__intro">
              {rep.intro.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          <div className="rp-cover__side">
            <aside className="rp-doc">
              <div className="rp-doc__band">
                <CoverLines />
                <Seal value={rep.label} kicker={U("تقرير دوري")} />
              </div>
              <div className="rp-doc__body">
                {rep.reportFile
                  ? <p className="rp-doc__file"><a className="btn btn--green" href={`/${rep.reportFile}`}>{U("ملف PDF")}</a></p>
                  : <Slot label={U("ملف التقرير PDF")} />}
                <nav className="rp-toc" aria-label={U("محتويات التقرير")}>
                  <p className="rp-toc__h">{U("محتويات التقرير")}</p>
                  <ol>
                    {toc.map((t) => (
                      <li key={t.href}>
                        <a href={t.href}>
                          {t.n ? <span className="rp-toc__n">{t.n}</span> : <span className="rp-toc__d" aria-hidden="true" />}
                          <span>{t.label}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {rep.notice?.length ? (
        <section className="band band--tight rp-notice-band">
          <div className="rp-sec__in reveal">
            <div className="rp-notice" role="note">
              <span className="rp-notice__ico" aria-hidden="true">
                {/* مربّع لطيف لا دائرة — قرار الهوية: لا أشكال دائرية في الموقع */}
                <svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" /><path d="M12 11v6M12 7.5v.5" /></svg>
              </span>
              <div>
                <h2 className="h-sub">{U("تنبيه توثيقي")}</h2>
                <div className="prose">
                  {rep.notice.map((p, i) => <p key={i}><Nums text={p} /></p>)}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* شريحة الأرقام — على الحبري: المؤشّر المتصدّر بجانب الحلقات، ثم
          بطاقات مرقّمة يمتلئ شريطها، ثم أبرز الإنجازات بطاقاتٍ */}
      <section className="band band--dark rp-kpi" id="rp-metrics">
        <div className="rp-sec__in reveal">
          <header className="rp-sec__head">
            <h2 className="h-sec">{rep.metricsTitle}</h2>
            <Seal value={rep.label} />
          </header>

          {leadMetrics.length > 0 && (
            <div className="rp-kpi__lead">
              <div className="rp-kpi__figs">
                {leadMetrics.map((m, i) => <FigureCell m={m} key={i} />)}
              </div>
            </div>
          )}

          {restMetrics.length > 0 && (
            <div className="rp-kpi__grid stagger rp-stag">
              {restMetrics.map((m, i) => (
                <div className="rp-kpi__card" key={i}>
                  <span className="rp-kpi__no" aria-hidden="true">{ord(i)}</span>
                  <FigureCell m={m} />
                </div>
              ))}
            </div>
          )}

          {rep.highlights?.length ? <ReportList items={rep.highlights} variant="brief" /> : null}
        </div>
      </section>

      {/* مسار الفصول — المجالات الواردة في هذه الفترة على سكّة واحدة يسري
          فيها خطّ أخضر عند الظهور؛ كلّ محطّة رابط إلى فصلها */}
      {chapters.length > 1 && (
        <section className="band rp-path">
          <div className="rp-sec__in reveal">
            <header className="rp-sec__head">
              <h2 className="h-sec">{U("مجالات العمل")}</h2>
              <PeriodTag label={rep.label} />
            </header>
            <ol className="rp-path__list stagger rp-stag">
              {chapters.map((p) => (
                <li key={p.id}>
                  <a className="rp-path__a" href={`#rp-${p.id}`}>
                    <span className="rp-path__mk" aria-hidden="true"><Icon id={p.id} /></span>
                    <span className="rp-path__n">{p.num}</span>
                    <span className="rp-path__t">{p.short}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* فصول المجالات: شريحة منقسمة — الصورة يحضنها لوح أخضر وشارة الرقم،
          والمتن بجانبها؛ تتبادل الجهتان من فصل إلى آخر. مجال بلا غلاف
          يأخذ لوحاً هندسياً برمزه، فلا يختلّ الإيقاع ولا يُخترع شيء. */}
      {chapters.map((p, idx) => {
        const sec = rep.sections[p.id];
        return (
          <section className={`band rp-ch${idx % 2 ? " rp-ch--flip" : ""}`} id={`rp-${p.id}`} key={p.id}>
            <div className="rp-ch__in reveal">
              <div className="rp-ch__media">
                {p.cover?.src ? (
                  <figure className="rp-ch__fig">
                    <img src={`/${p.cover.src}`} alt={p.cover.caption} loading="lazy" decoding="async" />
                  </figure>
                ) : (
                  <div className="rp-ch__fig rp-ch__fig--geo" aria-hidden="true">
                    <Icon id={p.id} />
                  </div>
                )}
                <span className="rp-ch__badge">{p.num}</span>
              </div>

              <div className="rp-ch__body">
                <p className="rp-ch__k">
                  <span className="rp-ch__ico" aria-hidden="true"><Icon id={p.id} /></span>
                  <span>{U("مجال عمل")}</span>
                  <PeriodTag label={rep.label} />
                </p>
                <h2 className="h-sec">{p.title}</h2>
                <p className="ph__orgs">{p.orgs}</p>
                <SectionBrief sec={sec} stagger />
                {sec.untranslated && <ArOnly href={`/p/${p.id}?lang=ar`} />}
                <p className="rp-ch__cta">
                  <Link className="btn btn--ghost" href={path(`/p/${p.id}`)}>
                    {U("تفاصيل")} {p.short}
                  </Link>
                </p>
              </div>
            </div>
          </section>
        );
      })}

      {rep.summary && (
        <RpSection id="rp-summary" title={rep.summary.title} tag={rep.label}>
          <Table t={{ head: rep.summary.head, rows: rep.summary.rows, foot: rep.summary.foot }} />
        </RpSection>
      )}

      <ListBand id="rp-reading" obj={rep.reading} variant="cards" cls="rp-tint" />
      <ListBand id="rp-notes" obj={rep.dataNotes} variant="notes" />
      <ListBand id="rp-opps" obj={rep.opportunities} variant="steps" />

      {rep.appeal?.title && (
        <RpSection id="rp-appeal" title={rep.appeal.title} tag={rep.label} cls="rp-tint">
          <p className="lead">{rep.appeal.lead}</p>
          <ReportList items={rep.appeal.items} variant="cards" />
          <div style={{ marginTop: "clamp(2rem,4vw,3rem)" }}>
            {donors.donateUrl
              ? <a className="btn btn--green" href={donors.donateUrl}
                   target="_blank" rel="noopener">{donors.donateLabel}</a>
              : <Slot label={U("رابط الدعم")} />}
          </div>
        </RpSection>
      )}

      {rep.appeal?.photo && (
        <Plate src={rep.appeal.photo.src} caption={rep.appeal.photo.caption} olive />
      )}

      {/* الخاتمة — بطاقة ورقية على أرضية فاتحة، تمسك زاويتها مربّعات الهوية */}
      {rep.closing && (
        <RpSection id="rp-closing" title={rep.closing.title} tag={rep.label} cls="rp-tint rp-closing">
          <div className="prose body-lg">
            {rep.closing.paragraphs.map((p, i) => <p key={i}><Nums text={p} /></p>)}
          </div>
          {rep.closing.signoff && <p className="signoff rp-signoff">{rep.closing.signoff}</p>}
        </RpSection>
      )}

      <section className="band pnav">
        <div className="sheet">
          <div className="sheet__main">
            {others.length > 0 && (
              <>
                <h2 className="h-sub">{U("تقارير أخرى")}</h2>
                <div className="pnav__grid" style={{ marginTop: "1.25rem" }}>
                  {others.map((r) => (
                    <Link className="pnav__card" href={path(`/reports/${r.id}`)} key={r.id}>
                      <span className="pnav__k">{r.label}</span>
                      <span className="pnav__t">{r.reportTitle}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
            <p style={{ marginTop: "1.5rem" }}>
              <Link className="btn btn--ghost" href={path("/")}>
                {U("العودة إلى الرئيسية")}
              </Link>
            </p>
          </div>
          <aside className="sheet__aside" />
        </div>
      </section>

      {/* شريط تقدّم القراءة — آخر الصفحة عمداً: أول ابن في main يأخذ حشوة
          الشريط العائم، وهذا مثبّت لا يأخذ مكاناً. يرسمه CSS حيث يُدعم
          ربط الحركة بالتمرير، ويغيب حيث لا يُدعم. */}
      <div className="rp-progress" aria-hidden="true" />
    </Layout>
  );
}
