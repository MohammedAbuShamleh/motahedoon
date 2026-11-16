import { Link } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { Icon } from "@/components/Icon";
import { Band, FigureCell, Plate, Seal, Slot } from "@/components/primitives";
import { Mark } from "@/components/primitives";
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

export default function Report({ report: rep, pillars, others }: Props) {
  const U = useU();
  const { locale, donors } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);

  const ListBand = ({ obj }: { obj: TitledList | null }) =>
    obj?.items?.length ? (
      <Band
        main={<><h2 className="h-sec">{obj.title}</h2><TitledItems items={obj.items} /></>}
        aside={<Seal value={rep.label} />}
      />
    ) : null;

  return (
    <Layout active="report">
      <Band
        cls="ph"
        noReveal
        main={
          <>
            <p className="ph__kicker">{U("الإنجازات")}</p>
            <h1 className="h-page">{rep.reportTitle}</h1>
            <p className="lead" style={{ marginTop: "clamp(1.5rem,3vw,2.25rem)" }}>
              {rep.range}
            </p>
            <div className="prose body-lg" style={{ marginTop: "clamp(1.75rem,3.5vw,2.5rem)" }}>
              {rep.intro.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </>
        }
        aside={
          <>
            <Seal value={rep.label} kicker={U("تقرير دوري")} />
            {rep.reportFile
              ? <p><a className="btn btn--ghost" href={`/${rep.reportFile}`}>{U("ملف PDF")}</a></p>
              : <Slot label={U("ملف التقرير PDF")} />}
          </>
        }
      />

      {rep.notice?.length ? (
        <Band
          cls="band--tight"
          main={
            <>
              <h2 className="h-sub">{U("تنبيه توثيقي")}</h2>
              <div className="prose" style={{ marginTop: "1rem" }}>
                {rep.notice.map((p, i) => <p key={i}><Nums text={p} /></p>)}
              </div>
            </>
          }
          aside={<Mark label={U("من التقرير")} />}
        />
      ) : null}

      <Band
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

      {/* إنجازات كل مجال في هذه الفترة، بترتيب المجالات الدائم */}
      {pillars
        .filter((p) => rep.sections?.[p.id])
        .map((p) => {
          const sec = rep.sections[p.id];
          return (
            <Band
              key={p.id}
              cls="period-body"
              main={
                <>
                  <p className="ph__kicker">
                    <Icon id={p.id} />
                    <span className="ph__kicker__n">{p.num}</span> {U("مجال عمل")}
                  </p>
                  <h2 className="h-sec">{p.title}</h2>
                  <p className="ph__orgs">{p.orgs}</p>
                  <SectionBrief sec={sec} />
                  {sec.untranslated && <ArOnly href={`/p/${p.id}?lang=ar`} />}
                  <p style={{ marginTop: "clamp(1.5rem,3vw,2.25rem)" }}>
                    <Link className="btn btn--ghost" href={path(`/p/${p.id}`)}>
                      {U("تفاصيل")} {p.short}
                    </Link>
                  </p>
                </>
              }
              aside={<Seal value={rep.label} />}
            />
          );
        })}

      {rep.summary && (
        <Band
          main={
            <>
              <h2 className="h-sec">{rep.summary.title}</h2>
              <div style={{ marginTop: "clamp(1.5rem,3vw,2.25rem)" }}>
                <Table t={{
                  head: rep.summary.head, rows: rep.summary.rows, foot: rep.summary.foot,
                }} />
              </div>
            </>
          }
          aside={<Seal value={rep.label} />}
        />
      )}

      <ListBand obj={rep.reading} />
      <ListBand obj={rep.dataNotes} />
      <ListBand obj={rep.opportunities} />

      {rep.appeal?.title && (
        <Band
          main={
            <>
              <h2 className="h-sec">{rep.appeal.title}</h2>
              <p className="lead" style={{ marginTop: "clamp(1.5rem,3vw,2.25rem)" }}>
                {rep.appeal.lead}
              </p>
              <ul className="bullets">
                {rep.appeal.items.map((i, k) => <li key={k}><Nums text={i} /></li>)}
              </ul>
              <div style={{ marginTop: "clamp(2rem,4vw,3rem)" }}>
                {donors.donateUrl
                  ? <a className="btn btn--green" href={donors.donateUrl}
                       target="_blank" rel="noopener">{donors.donateLabel}</a>
                  : <Slot label={U("رابط الدعم")} />}
              </div>
            </>
          }
          aside={<Seal value={rep.label} />}
        />
      )}

      {rep.appeal?.photo && (
        <Plate src={rep.appeal.photo.src} caption={rep.appeal.photo.caption} olive />
      )}

      {rep.closing && (
        <Band
          main={
            <>
              <h2 className="h-sec">{rep.closing.title}</h2>
              <div className="prose body-lg" style={{ marginTop: "clamp(1.5rem,3vw,2.25rem)" }}>
                {rep.closing.paragraphs.map((p, i) => <p key={i}><Nums text={p} /></p>)}
              </div>
              {rep.closing.signoff && <p className="signoff">{rep.closing.signoff}</p>}
            </>
          }
          aside={<Seal value={rep.label} />}
        />
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
