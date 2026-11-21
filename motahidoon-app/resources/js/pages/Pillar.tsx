import { Link } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { Icon } from "@/components/Icon";
import { Slot } from "@/components/primitives";
import { ArOnly, Blocks, Gallery, Groups, SectionBrief, Table } from "@/features/report/parts";
import { useSite, useU } from "@/lib/site";
import type { Pillar as P, ReportSection } from "@/types";

interface PillarRef { id: string; num: string; short: string }

interface Props {
  pillar: P;
  index: number;
  total: number;
  prev: P | null;
  next: P | null;
  section: ReportSection | null;
  report: { id: string; label: string } | null;
  alsoIn: { id: string; label: string }[];
  pillars: PillarRef[];
}

/* =====================================================================
   صفحة المجال بلغة صفحة التقرير (rp-*): غلاف ببطاقة تعريف وفهرس المجالات
   — الجزء الدائم، لا تاريخ فيه — ثم فصل منقسم للفترة (الصورة بإطارها وشارة
   الرقم، والمتن بوسم فترته)، ثم التفصيل الكامل، ثم التنقّل. النصّ كلّه من
   المصدر؛ الجديد هندسة فقط.
   ===================================================================== */

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
  pillar: p, total, prev, next, section, report, alsoIn, pillars,
}: Props) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);
  const detailed = Boolean(
    section && !section.untranslated
    && (section.blocks || section.table || section.groups || section.gallery?.length),
  );

  return (
    <Layout>
      {/* الغلاف — الجزء الدائم: العنوان والمؤسسات والتعريف في جهة، وبطاقة
          المجال بفهرس المجالات كلّها في الأخرى */}
      <section className="band rp-cover pcover">
        <div className="rp-cover__in">
          <div className="rp-cover__main">
            <p className="ph__kicker">{U("مجال عمل")}</p>
            <h1 className="h-page">{p.title}</h1>
            <p className="ph__orgs">{p.orgs}</p>
            <div className="prose body-lg rp-cover__intro">
              {p.definition
                ? <p>{p.definition}</p>
                : <Slot label={U("التعريف الدائم بالمجال")} />}
            </div>
          </div>

          <div className="rp-cover__side">
            <aside className="rp-doc pdoc">
              <div className="rp-doc__band pdoc__band">
                <span className="pdoc__ico" aria-hidden="true"><Icon id={p.id} /></span>
                <p className="pdoc__id">
                  <span className="pdoc__k">{U("مجال عمل")}</span>
                  <span className="pdoc__v">{p.num} / {String(total).padStart(2, "0")}</span>
                </p>
              </div>
              <div className="rp-doc__body">
                <nav className="rp-toc" aria-label={U("مجالات العمل")}>
                  <p className="rp-toc__h">{U("مجالات العمل")}</p>
                  <ol>
                    {pillars.map((x) => (
                      <li key={x.id}>
                        <Link
                          href={path(`/p/${x.id}`)}
                          aria-current={x.id === p.id ? "page" : undefined}
                        >
                          <span className="rp-toc__n">{x.num}</span>
                          <span>{x.short}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* الفصل المؤرَّخ: أحدث تقرير يذكر هذا المجال، وقد لا يكون الحالي —
          الصورة بإطارها وشارة الرقم، والمتن يحمل وسم فترته */}
      <section className="band rp-ch" id="period">
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
            {section && report ? (
              <>
                <p className="rp-ch__k">
                  <span className="rp-ch__ico" aria-hidden="true"><Icon id={p.id} /></span>
                  <span>{U("حصيلة فترة")}</span>
                  <span className="rp-tag">{report.label}</span>
                </p>
                <h2 className="h-sec">{U("إنجازات الفترة")}</h2>
                {section.untranslated ? (
                  <>
                    <SectionBrief sec={section} />
                    <ArOnly href={`/p/${p.id}?lang=ar`} />
                  </>
                ) : section.lead ? (
                  <p className="lead pch__lead">{section.lead}</p>
                ) : null}
                <p className="rp-ch__cta">
                  <Link className="btn btn--ghost" href={path(`/reports/${report.id}`)}>
                    {U("التقرير الكامل")}
                  </Link>
                </p>
                {alsoIn.length > 0 && (
                  <p className="pch__also">
                    <span className="pch__also-k">{U("فترات أخرى")}</span>
                    {alsoIn.map((r) => (
                      <Link className="rp-tag" key={r.id} href={path(`/reports/${r.id}`)}>{r.label}</Link>
                    ))}
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="h-sec">{U("إنجازات الفترة")}</h2>
                <div className="pch__empty">
                  <Slot label={U("حصيلة هذا المجال")} state={U("لم تَرِد في التقارير المنشورة بعد")} />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* التفصيل الكامل للفترة: كتل الأرقام والجدول والمجموعات والمعرض */}
      {detailed && section && report ? (
        <section className="band rp-sec pdetail">
          <div className="rp-sec__in reveal">
            <header className="rp-sec__head">
              <h2 className="h-sec">{U("التفاصيل الكاملة")}</h2>
              <span className="rp-tag">{report.label}</span>
            </header>
            {section.blocks ? <Blocks blocks={section.blocks} /> : null}
            {section.table ? <Table t={section.table} /> : null}
            {section.groups ? <Groups groups={section.groups} /> : null}
            <Gallery items={section.gallery} />
          </div>
        </section>
      ) : null}

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
        </div>
      </section>
    </Layout>
  );
}
