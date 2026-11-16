import { Link } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { Icon } from "@/components/Icon";
import { Band, Mark, Plate, Seal, Slot } from "@/components/primitives";
import { ArOnly, Section, SectionBrief } from "@/features/report/parts";
import { useSite, useU } from "@/lib/site";
import type { Pillar as P, ReportSection } from "@/types";

interface Props {
  pillar: P;
  index: number;
  total: number;
  prev: P | null;
  next: P | null;
  section: ReportSection | null;
  report: { id: string; label: string } | null;
  alsoIn: { id: string; label: string }[];
}

function NavCard({ kicker, item, href }: { kicker: string; item: P | null; href: string }) {
  if (!item) return <span className="pnav__empty" />;
  return (
    <Link className="pnav__card" href={href}>
      <span className="pnav__k">{kicker}</span>
      <span className="pnav__t">{item.short}</span>
    </Link>
  );
}

export default function Pillar({
  pillar: p, index, total, prev, next, section, report, alsoIn,
}: Props) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);

  return (
    <Layout>
      {/* الجزء الدائم: لا تاريخ فيه */}
      <Band
        cls="ph"
        noReveal
        main={
          <>
            <p className="ph__mark">
              <span className="ph__ico"><Icon id={p.id} /></span>
              <span className="ph__of">{p.num} / {total}</span>
            </p>
            <h1 className="h-page">{p.title}</h1>
            <p className="ph__orgs">{p.orgs}</p>
            <div className="ph__def">
              {p.definition
                ? <p className="lead">{p.definition}</p>
                : <Slot label={U("التعريف الدائم بالمجال")} />}
            </div>
          </>
        }
        aside={
          <>
            <span className="pos" aria-hidden="true">
              {Array.from({ length: total }, (_, k) => (
                <span className={k === index ? "pos__d is-on" : "pos__d"} key={k} />
              ))}
            </span>
            <Mark label={U("مجال عمل")} />
          </>
        }
      />

      {p.cover && (
        <Plate src={p.cover.src} caption={p.cover.caption} olive num={p.num} />
      )}

      {/* الجزء المؤرَّخ: أحدث تقرير يذكر هذا المجال، وقد لا يكون الحالي */}
      {section && report ? (
        <Band
          cls="period-body"
          main={
            <>
              <h2 className="h-sec">{U("إنجازات الفترة")}</h2>
              {section.untranslated ? (
                <>
                  <SectionBrief sec={section} />
                  <ArOnly href={`/p/${p.id}?lang=ar`} />
                </>
              ) : (
                <Section sec={section} />
              )}
            </>
          }
          aside={
            <>
              <Seal value={report.label} />
              <p style={{ marginTop: "1.25rem" }}>
                <Link className="btn btn--ghost" href={path(`/reports/${report.id}`)}>
                  {U("التقرير الكامل")}
                </Link>
              </p>
              {alsoIn.length > 0 && (
                <>
                  <p className="mark" style={{ marginTop: "2rem" }}>
                    <span className="mark__t">{U("فترات أخرى")}</span>
                  </p>
                  <ul className="footer__list aside-list">
                    {alsoIn.map((r) => (
                      <li key={r.id}>
                        <Link href={path(`/reports/${r.id}`)}>{r.label}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          }
        />
      ) : (
        <Band
          main={
            <>
              <h2 className="h-sec">{U("إنجازات الفترة")}</h2>
              <div style={{ marginTop: "1.5rem" }}>
                <Slot
                  label={U("حصيلة هذا المجال")}
                  state={U("لم تَرِد في التقارير المنشورة بعد")}
                />
              </div>
            </>
          }
          aside={<Mark label={U("حصيلة")} />}
        />
      )}

      <section className="band pnav">
        <div className="sheet">
          <div className="sheet__main">
            <div className="pnav__grid">
              <NavCard kicker={U("المجال السابق")} item={prev}
                       href={prev ? path(`/p/${prev.id}`) : ""} />
              <NavCard kicker={U("المجال التالي")} item={next}
                       href={next ? path(`/p/${next.id}`) : ""} />
            </div>
            <p style={{ marginTop: "1.5rem" }}>
              <Link className="btn btn--ghost" href={`${path("/")}#fields`}>
                {U("كل المجالات")}
              </Link>
            </p>
          </div>
          <aside className="sheet__aside" />
        </div>
      </section>
    </Layout>
  );
}
