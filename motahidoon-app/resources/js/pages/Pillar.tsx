import { RichText } from "@/components/RichText";
import { Link } from "@inertiajs/react";
import type { CSSProperties } from "react";
import { Layout } from "@/app/Layout";
import { Icon } from "@/components/Icon";
import { Slot } from "@/components/primitives";
import { ArOnly, Blocks, Gallery, Groups, Table, sectionStats } from "@/features/report/parts";
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
   صفحة المجال — تصميم جديد كلّياً (بطلب صاحب المشروع 2026-11-21)
   رسمية بالأبيض والأسود، والصور كاملة بنسبتها — لا قصّ:
     ١. افتتاحية بملء الشاشة، نصفان: المتن الدائم على الورق (العنوان
        والمؤسسات والتعريف)، والغلاف على الحبري برقم المجال كبيراً خلفه.
     ٢. شريط المجالات: المجالات كلّها بأرقامها، والحالي ممتلئ بالحبري.
     ٣. حصيلة الفترة: رأس بوسم الفترة وزرّ التقرير، ثم الافتتاحية وأرقامها
        بطاقاتٍ حبرية — كلّها موسومة بفترتها (قاعدة الحاشية).
     ٤. التفاصيل الكاملة: عمود عنوان ملتصق، والمحتوى بجانبه.
     ٥. السابق والتالي: نصفان كبيران، ورقيّ وحبريّ.
   النصّ كلّه من المصدر، والتسميات كلّها موجودة مترجمة؛ الجديد هندسة فقط.
   ===================================================================== */

const pad = (n: number) => String(n).padStart(2, "0");

/** نصف من شريط السابق/التالي: التسمية، فالرقم والاسم، فسهم. */
function NavHalf({ kicker, item, href, dir }: {
  kicker: string; item: P | null; href: string; dir: "prev" | "next";
}) {
  if (!item) return <span className={`pa-next__half pa-next__half--${dir} is-empty`} aria-hidden="true" />;
  return (
    <Link className={`pa-next__half pa-next__half--${dir}`} href={href}>
      <span className="pa-next__k">{kicker}</span>
      <span className="pa-next__n">{item.num}</span>
      <span className="pa-next__t">{item.short}</span>
      <span className="pa-next__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24">{dir === "next" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}</svg>
      </span>
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
  /* أرقام الفترة: المعتمدة إن وُجدت، وإلا المستخرجة من بنودها كما كُتبت —
     استخراج لا اشتقاق (القاعدة نفسها في صفحة التقرير) */
  const stats = section
    ? (section.stats?.length ? section.stats : sectionStats(section).slice(0, 8))
    : [];

  return (
    <Layout>
      {/* ١. الافتتاحية — الجزء الدائم، لا تاريخ فيه */}
      <section className="pa-hero">
        <div className="pa-hero__text reveal">
          {/* رجوع صريح إلى الرئيسية، فوق كلّ شيء — السهم مرسوم للعربية ويُعكس في اللاتينية */}
          <Link className="pa-back" href={path("/")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            {U("العودة إلى الرئيسية")}
          </Link>
          <p className="pa-hero__k">
            <span className="pa-hero__ico" aria-hidden="true"><Icon id={p.id} /></span>
            <span>{U("مجال عمل")}</span>
            <span className="pa-hero__count">{p.num} / {pad(total)}</span>
          </p>
          <h1 className="pa-hero__title">{p.title}</h1>
          <p className="pa-hero__orgs">{p.orgs}</p>
          <div className="pa-hero__def">
            {p.definition
              ? <RichText value={p.definition} />
              : <Slot label={U("التعريف الدائم بالمجال")} />}
          </div>
          <p className="pa-hero__cta">
            <a className="btn pa-btn" href="#period">
              {U("إنجازات الفترة")}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </a>
          </p>
        </div>

        {/* الغلاف كاملاً بنسبته على الحبري، ورقم المجال كبيراً خلفه */}
        <div className="pa-hero__media">
          <span className="pa-hero__num" aria-hidden="true">{p.num}</span>
          {p.cover?.src ? (
            <figure className="pa-hero__fig reveal">
              <img src={`/${p.cover.src}`} alt={p.cover.caption} decoding="async" />
            </figure>
          ) : (
            <div className="pa-hero__fig pa-hero__fig--geo reveal" aria-hidden="true"><Icon id={p.id} /></div>
          )}
        </div>
      </section>

      {/* ٢. شريط المجالات */}
      <nav className="pa-tabs" aria-label={U("مجالات العمل")}>
        <ol className="pa-tabs__list">
          {pillars.map((x, i) => (
            <li key={x.id} style={{ "--i": i } as CSSProperties}>
              <Link
                className="pa-tabs__a"
                href={path(`/p/${x.id}`)}
                aria-current={x.id === p.id ? "page" : undefined}
              >
                <span className="pa-tabs__n">{x.num}</span>
                <span className="pa-tabs__t">{x.short}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* ٣. حصيلة الفترة: أحدث تقرير يذكر هذا المجال، وقد لا يكون الحالي */}
      <section className="band pa-period" id="period">
        <div className="pa-wrap reveal">
          <header className="pa-head">
            <div className="pa-head__main">
              {report && (
                <p className="pa-head__k">
                  <span>{U("حصيلة فترة")}</span>
                  <span className="rp-tag">{report.label}</span>
                </p>
              )}
              <h2 className="pa-head__title">{U("إنجازات الفترة")}</h2>
            </div>
            {section && report && (
              <Link className="btn pa-btn" href={path(`/reports/${report.id}`)}>
                {U("التقرير الكامل")}
              </Link>
            )}
          </header>

          {section && report ? (
            <>
              {section.lead && <RichText className="pa-period__lead" value={section.lead} />}
              {stats.length > 0 && (
                <ul className="pa-stats">
                  {stats.map((s, i) => (
                    <li className="pa-stat" key={`${s.value}-${i}`} style={{ "--i": Math.min(i, 11) } as CSSProperties}>
                      <span className="pa-stat__no" aria-hidden="true">{pad(i + 1)}</span>
                      <span className="pa-stat__v" style={{ "--len": s.value.length } as CSSProperties}>
                        <bdi>{s.value}</bdi>
                      </span>
                      <span className="pa-stat__u">{s.unit}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.untranslated && <ArOnly href={`/p/${p.id}?lang=ar`} />}
              {alsoIn.length > 0 && (
                <p className="pa-also">
                  <span className="pa-also__k">{U("فترات أخرى")}</span>
                  {alsoIn.map((r) => (
                    <Link className="rp-tag" key={r.id} href={path(`/reports/${r.id}`)}>{r.label}</Link>
                  ))}
                </p>
              )}
            </>
          ) : (
            <div className="pa-period__empty">
              <Slot label={U("حصيلة هذا المجال")} state={U("لم تَرِد في التقارير المنشورة بعد")} />
            </div>
          )}
        </div>
      </section>

      {/* ٤. التفاصيل الكاملة: عمود عنوان ملتصق، والمحتوى بجانبه */}
      {detailed && section && report ? (
        <section className="band pa-detail">
          <div className="pa-wrap pa-detail__in">
            <aside className="pa-detail__aside">
              <div className="pa-detail__stick">
                <h2 className="pa-head__title">{U("التفاصيل الكاملة")}</h2>
                <span className="rp-tag">{report.label}</span>
              </div>
            </aside>
            <div className="pa-detail__main reveal">
              {section.blocks ? <Blocks blocks={section.blocks} /> : null}
              {section.table ? <Table t={section.table} /> : null}
              {section.groups ? <Groups groups={section.groups} /> : null}
              <Gallery items={section.gallery} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ٥. السابق والتالي */}
      <nav className="pa-next" aria-label={U("مجالات العمل")}>
        <div className="pa-next__grid">
          <NavHalf kicker={U("المجال السابق")} item={prev} dir="prev"
                   href={prev ? path(`/p/${prev.id}`) : ""} />
          <NavHalf kicker={U("المجال التالي")} item={next} dir="next"
                   href={next ? path(`/p/${next.id}`) : ""} />
        </div>
        <p className="pa-next__all">
          <Link className="btn btn--ghost" href={`${path("/")}#fields`}>{U("كل المجالات")}</Link>
        </p>
      </nav>
    </Layout>
  );
}
