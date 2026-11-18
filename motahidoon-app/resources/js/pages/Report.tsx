import { Link } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { Icon } from "@/components/Icon";
import type { ReactNode } from "react";
import { Band, FigureCell, Plate, Seal, Slot } from "@/components/primitives";
import { ArOnly, SectionBrief, Table, TitledItems } from "@/features/report/parts";
import { Nums } from "@/lib/nums";
import { useSite, useU } from "@/lib/site";
import type { Report as R, TitledList } from "@/types";

interface PillarRef {
  id: string; num: string; title: string; short: string; orgs: string;
}

interface Props {
  report: R;
  pillars: PillarRef[];
  others: { id: string; label: string; reportTitle: string }[];
}

/* وسم الفترة المختصر: كلّ قسم مؤرَّخ يحمل فترته بصرياً (قاعدة الحاشية)،
   بوسم صغير في رأسه بدل صفّ ختم كامل يتكرّر فوق كلّ قسم. */
function PeriodTag({ label }: { label: string }) {
  return <span className="rp-tag">{label}</span>;
}

/* قسم من أقسام التقرير: رأس موحّد (العنوان ووسم الفترة) ثم المحتوى. */
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

export default function Report({ report: rep, pillars, others }: Props) {
  const U = useU();
  const { locale, donors } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);

  const chapters = pillars.filter((p) => rep.sections?.[p.id]);

  const ListBand = ({ id, obj }: { id: string; obj: TitledList | null }) =>
    obj?.items?.length ? (
      <RpSection id={id} title={obj.title} tag={rep.label}>
        <TitledItems items={obj.items} />
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
      {/* الغلاف: العنوان والمقدّمة في جهة، وبطاقة الوثيقة في الأخرى —
          الفترة، وملف PDF، ومحتويات التقرير */}
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

          <aside className="rp-doc">
            <div className="rp-doc__band">
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
      </section>

      {rep.notice?.length ? (
        <section className="band band--tight rp-notice-band">
          <div className="rp-sec__in reveal">
            <div className="rp-notice" role="note">
              <span className="rp-notice__ico" aria-hidden="true">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg>
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

      <Band
        id="rp-metrics"
        cls="band--dark"
        main={
          <>
            <h2 className="h-sec">{rep.metricsTitle}</h2>
            <div className="figs figs--tiles stagger">
              {rep.metrics.map((m, i) => <FigureCell m={m} key={i} />)}
            </div>
            {rep.highlights?.length ? (
              <ul className="bullets" style={{ marginTop: "clamp(2.5rem,5vw,3.5rem)" }}>
                {rep.highlights.map((h, i) => <li key={i}><Nums text={h} /></li>)}
              </ul>
            ) : null}
          </>
        }
        aside={<Seal value={rep.label} />}
      />

      {/* فصول المجالات: إنجازات كلّ مجال في هذه الفترة، بترتيب المجالات الدائم.
          سكّة جانبية تحمل رقم المجال ورمزه، والمتن بجانبها */}
      {chapters.map((p) => {
        const sec = rep.sections[p.id];
        return (
          <section className="band rp-ch" id={`rp-${p.id}`} key={p.id}>
            <div className="rp-ch__in reveal">
              <div className="rp-ch__rail">
                <span className="rp-ch__n">{p.num}</span>
                <span className="rp-ch__ico" aria-hidden="true"><Icon id={p.id} /></span>
              </div>
              <div className="rp-ch__body">
                <p className="rp-ch__k">
                  <span>{U("مجال عمل")}</span>
                  <PeriodTag label={rep.label} />
                </p>
                <h2 className="h-sec">{p.title}</h2>
                <p className="ph__orgs">{p.orgs}</p>
                <SectionBrief sec={sec} />
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

      <ListBand id="rp-reading" obj={rep.reading} />
      <ListBand id="rp-notes" obj={rep.dataNotes} />
      <ListBand id="rp-opps" obj={rep.opportunities} />

      {rep.appeal?.title && (
        <RpSection id="rp-appeal" title={rep.appeal.title} tag={rep.label}>
          <p className="lead">{rep.appeal.lead}</p>
          <ul className="bullets">
            {rep.appeal.items.map((i, k) => <li key={k}><Nums text={i} /></li>)}
          </ul>
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

      {rep.closing && (
        <RpSection id="rp-closing" title={rep.closing.title} tag={rep.label} cls="rp-closing">
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
    </Layout>
  );
}
