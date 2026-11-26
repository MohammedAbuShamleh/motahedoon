/* مفردات عرض التقرير — نقل حرفي لدوال app.js الثابت:
   statsOf · renderGroups · renderBlocks · renderTable · renderGallery ·
   renderSection · renderSectionBrief · arOnly. */

import { Nums } from "@/lib/nums";
import { statsOf } from "@/lib/stats";
import { isHtml } from "@/lib/rich";
import { RichText } from "@/components/RichText";
import { COUNTS, useCount, useSite, useU } from "@/lib/site";
import { FigureCell, StatStrip } from "@/components/primitives";
import type {
  Entry, FigureBlock, GalleryItem, ReportGroup, ReportSection, ReportTable, Stat,
} from "@/types";

/* استخراج الأرقام من البنود في @/lib/stats — مشترك مع اللوحة لتعرض
   للمحرِّر البطاقات التلقائية نفسها التي يرسمها الموقع. */
export { statsOf } from "@/lib/stats";

/** كل أرقام المجال في فترة واحدة، مجموعة من مجموعاته وكتله. */
export function sectionStats(sec: ReportSection): Stat[] {
  let out: Stat[] = [];
  (sec.groups ?? []).forEach((g) => { out = out.concat(g.stats?.length ? g.stats : statsOf(g.items)); });
  (sec.blocks ?? []).forEach((b) => {
    (b.figures ?? []).forEach((f) =>
      out.push({
        value: (f.prefix ? `${f.prefix} ` : "") + f.value,
        unit: f.unit || f.label,
      }),
    );
  });
  return out;
}

function EntryList({ items }: { items: Entry[] }) {
  return (
    <ul className="entries">
      {items.map((it, i) => (
        <li className={it.term ? "entry" : "entry entry--plain"} key={i}>
          {it.term ? <p className="entry__term">{it.term}</p> : null}
          <RichText className="entry__text" value={it.text} nums />
        </li>
      ))}
    </ul>
  );
}

export function Groups({ groups }: { groups: ReportGroup[] }) {
  const U = useU();
  const C = useCount();
  return (
    <>
      {groups.map((g, gi) => {
        /* فقرات «الخلاصة» تلخّص الأرقام فوقها — أداة قراءة خطية لا محتوى.
           تُطوى ولا تُحذف: النص باقٍ في المصدر وفي الإفصاح. */
        const main = g.items.filter((it) => !it.recap);
        const recap = g.items.filter((it) => it.recap);
        // البطاقات المحرَّرة من اللوحة أوّلاً، وإلا المستخرجة من البنود
        const stats = g.stats?.length ? g.stats : statsOf(main);

        // مجموعة كلها خلاصة: لا تُعرض إلا مطويّة.
        if (g.recap) {
          return (
            <div className="group" key={gi}>
              <details className="more more--recap">
                <summary><span>{g.title || U("خلاصة")}</span></summary>
                <div className="prose" style={{ marginTop: ".9rem" }}>
                  {g.items.map((it, i) => <RichText key={i} value={it.text} nums />)}
                </div>
              </details>
            </div>
          );
        }

        // تُطوى القائمة إن كانت أرقاماً مستخرجة، أو إن طالت وصفياً.
        const foldable = (stats.length >= 2 && main.length >= 3) || main.length >= 4;

        return (
          <div className="group" key={gi}>
            {(g.title || g.num) && (
              <div className="group__head">
                {g.num ? <span className="group__num">{g.num}</span> : null}
                {g.title ? <h3 className="h-sub">{g.title}</h3> : null}
              </div>
            )}
            <StatStrip stats={stats} />
            {foldable ? (
              <details className="more">
                <summary>
                  <span>{U("التفاصيل الكاملة")}</span>
                  <small>{main.length} {C(main.length, COUNTS.items)}</small>
                </summary>
                <EntryList items={main} />
              </details>
            ) : (
              <EntryList items={main} />
            )}
            {recap.length > 0 && (
              <details className="more more--recap">
                <summary>
                  <span>{U("خلاصة القسم")}</span>
                  <small>{recap.length} {C(recap.length, COUNTS.paras)}</small>
                </summary>
                <div className="prose" style={{ marginTop: ".9rem" }}>
                  {recap.map((it, i) => <RichText key={i} value={it.text} nums />)}
                </div>
              </details>
            )}
          </div>
        );
      })}
    </>
  );
}

export function Blocks({ blocks }: { blocks: FigureBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <div className="block" key={i}>
          <h3 className="h-sub">{b.title}</h3>
          <div className="figs figs--dense">
            {b.figures.map((f, k) => <FigureCell m={f} key={k} />)}
          </div>
          {b.note && (isHtml(b.note.text) ? (
            <div className="block__note">
              <b>{b.note.term}:</b> <RichText value={b.note.text} nums />
            </div>
          ) : (
            <p className="block__note">
              <b>{b.note.term}:</b> <Nums text={b.note.text} />
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

export function Table({ t }: { t: ReportTable }) {
  return (
    <>
      {t.title ? <h3 className="h-sub">{t.title}</h3> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{t.head.map((h, i) => <th scope="col" key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i}>{r.map((c, k) => <td key={k}><Nums text={c} /></td>)}</tr>
            ))}
          </tbody>
          {t.foot && (
            <tfoot><tr>{t.foot.map((c, i) => <td key={i}>{c}</td>)}</tr></tfoot>
          )}
        </table>
      </div>
      {t.footNote ? <p className="table-note"><Nums text={t.footNote} /></p> : null}
    </>
  );
}

export function Gallery({ items }: { items: GalleryItem[] | null | undefined }) {
  if (!items?.length) return null;
  return (
    <div className="gallery">
      {items.map((g) => (
        <figure key={g.src}>
          <img src={`/${g.src}`} alt={g.caption} loading="lazy" />
          <figcaption>{g.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** عرض مختصر: الافتتاحية وأرقامها فقط. المتن الكامل في صفحة المجال.
    stagger: خانات الأرقام تتتابع عند ظهور القسم (صفحة التقرير). */
export function SectionBrief({ sec, stagger }: { sec: ReportSection; stagger?: boolean }) {
  const stats = sec.stats?.length ? sec.stats : sectionStats(sec).slice(0, 8);
  return (
    <>
      {sec.lead && (
        <RichText className="lead" style={{ marginTop: "clamp(1.25rem,2.5vw,1.9rem)" }} value={sec.lead} />
      )}
      <StatStrip stats={stats} cls={stagger ? "stagger" : undefined} />
    </>
  );
}

/** محتوى مجال واحد داخل فترة واحدة. */
export function Section({ sec }: { sec: ReportSection }) {
  return (
    <>
      {sec.lead && (
        <RichText className="lead" style={{ marginTop: "clamp(1.25rem,2.5vw,1.9rem)" }} value={sec.lead} />
      )}
      <div style={{ marginTop: "clamp(1.75rem,3.5vw,2.75rem)" }}>
        {sec.blocks ? <Blocks blocks={sec.blocks} /> : null}
        {sec.table ? <Table t={sec.table} /> : null}
        {sec.groups ? <Groups groups={sec.groups} /> : null}
        <Gallery items={sec.gallery} />
      </div>
    </>
  );
}

/** تنويه: التفصيل الكامل متاح بالعربية فقط حتى الآن. */
export function ArOnly({ href }: { href: string }) {
  const { locale } = useSite();
  const U = useU();
  if (locale === "ar") return null;
  return (
    <p className="ar-only">
      <a href={href}>{U("التفاصيل الكاملة متاحة بالعربية")}</a>
    </p>
  );
}

/** قائمة معنونة أو نقطية، حسب شكل أول بند. */
export function TitledItems({ items }: { items: (Entry | string)[] }) {
  const titled = typeof items[0] === "object" && items[0] !== null;
  if (titled) {
    return (
      <ul className="entries" style={{ marginTop: "clamp(1.5rem,3vw,2.25rem)" }}>
        {(items as Entry[]).map((it, i) => (
          <li className={it.term ? "entry" : "entry entry--plain"} key={i}>
            {it.term ? <p className="entry__term">{it.term}</p> : null}
            <RichText className="entry__text" value={it.text} nums />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="bullets" style={{ marginTop: "clamp(1.5rem,3vw,2.25rem)" }}>
      {(items as string[]).map((it, i) => <li key={i}><Nums text={it} /></li>)}
    </ul>
  );
}
