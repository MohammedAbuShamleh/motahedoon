/* =====================================================================
   مفردات البنية — نقل حرفي لقوالب app.js الثابت.
   كل مكوّن هنا يُخرج الأصناف نفسها، فـstyle.css يسري بلا تعديل حرف.
   ===================================================================== */

import type { ReactNode } from "react";
import { Nums } from "@/lib/nums";
import { useU } from "@/lib/site";
import type { Metric, Stat } from "@/types";

/* الحاوية: متن وحاشية.
   noReveal: ما يقع فوق الطية يُرسم ثابتاً، فلا يستقبل الزائر صفحة فارغة. */
export function Band({
  id, cls, main, aside, noReveal,
}: {
  id?: string;
  cls?: string;
  main: ReactNode;
  aside?: ReactNode;
  noReveal?: boolean;
}) {
  return (
    <section className={`band ${cls ?? ""}`} id={id}>
      <div className={noReveal ? "sheet" : "sheet reveal"}>
        <div className="sheet__main">{main}</div>
        {/* بلا محتوى جانبي لا يُرسم الهامش — وإلا بقيت شعرته الفاصلة وحدها */}
        {aside && <aside className="sheet__aside">{aside}</aside>}
      </div>
    </section>
  );
}

/** رأس قسم موحّد في الرئيسية، بهيئة رأس صفحة التقرير: العنوان في الوسط،
    وتحته سطر وسوم (الحقائق والخانات المحجوزة والإجراءات)، ثم شعرة تفصل
    الرأس عن المحتوى. لا نصّ تعريفي تحت العنوان — لا يُخترع نصّ. */
export function SectionHead({ title, side }: { title: ReactNode; side?: ReactNode }) {
  return (
    <header className="shead">
      <div className="shead__main">
        <h2 className="h-sec shead__title">{title}</h2>
      </div>
      {side && <div className="shead__side">{side}</div>}
    </header>
  );
}

/** قسم الرئيسية: حاوية بعرض العمود، رأس موحّد ثم المحتوى بعرض كامل تحته. */
export function Section({
  id, cls, head, children,
}: {
  id?: string;
  cls?: string;
  head: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={`band sec ${cls ?? ""}`} id={id}>
      <div className="sec__in reveal">
        {head}
        {children}
      </div>
    </section>
  );
}

/** خانة محجوزة لحقل غير معتمد. تبدو مقصودة، وتُستبدل تلقائياً حين يُملأ. */
export function Slot({ label, state }: { label: string; state?: string }) {
  const U = useU();
  return (
    <div className="slot">
      <p className="slot__label">{label}</p>
      <p className="slot__state">{state ?? U("بانتظار اعتماد التجمع")}</p>
    </div>
  );
}

export function Filled({ label, value }: { label: string; value: string }) {
  return (
    <div className="slot">
      <p className="slot__label">{label}</p>
      <p className="slot__state">{value}</p>
    </div>
  );
}

/** ختم الفترة — الموضع الوحيد الذي يجوز أن يظهر فيه تاريخ. */
export function Seal({ value, kicker }: { value: string; kicker?: string }) {
  const U = useU();
  return (
    <p className="seal">
      <span className="seal__k">{kicker ?? U("حصيلة فترة")}</span>
      <span className="seal__v">{value}</span>
    </p>
  );
}

export function Mark({ n, label }: { n?: string; label: string }) {
  return (
    <p className="mark">
      {n ? <span className="mark__n">{n}</span> : null}
      <span className="mark__t">{label}</span>
    </p>
  );
}

export function Fact({
  value, label, isText,
}: {
  value: string;
  label: string;
  isText?: boolean;
}) {
  return (
    <div className={isText ? "fact fact--text" : "fact"}>
      <span className="fact__v">{value}</span>
      <span className="fact__l">{label}</span>
    </div>
  );
}

export function Statement({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return <div className="sub-head"><Slot label={label} /></div>;
  }
  return (
    <div className="statement">
      <p className="statement__k">{label}</p>
      <p className="statement__v"><Nums text={value} /></p>
    </div>
  );
}

/* --len يقود حجم الخط: رقم أطول يُصغَّر ليتّسع، بلا قصّ ولا اختصار.
   عرضيّ محض — القيمة نفسها لا تُمسّ. */
export function FigureCell({ m }: { m: Metric }) {
  const shown = (m.prefix ? `${m.prefix} ` : "") + m.value;
  return (
    <div className={m.accent ? "fig fig--accent" : "fig"}>
      <p className="fig__v" style={{ "--len": shown.length } as React.CSSProperties}>
        <bdi>{shown}</bdi>
      </p>
      {m.unit ? <span className="fig__u">{m.unit}</span> : null}
      <p className="fig__l">{m.label}</p>
    </div>
  );
}

/* cls اختياري: صفحة التقرير تمرّر stagger فتتتابع الخانات عند الظهور */
export function StatStrip({ stats, cls }: { stats: Stat[]; cls?: string }) {
  if (!stats.length) return null;
  return (
    <div className={cls ? `stats ${cls}` : "stats"}>
      {stats.map((s, i) => (
        <div className="stat" key={`${s.value}-${s.unit}-${i}`}>
          <span className="stat__v" style={{ "--len": s.value.length } as React.CSSProperties}>
            <bdi>{s.value}</bdi>
          </span>
          <span className="stat__u">{s.unit}</span>
        </div>
      ))}
    </div>
  );
}

/** رقم يجلس في مربع ورقي يقطع حافة الصورة — الهندسة تمسك الورق بالميدان. */
export function Plate({
  src, caption, olive, pos, num,
}: {
  src: string;
  caption: string;
  olive?: boolean;
  pos?: string;
  num?: string;
}) {
  return (
    <figure
      className={`band band--flush band--noline plate${olive ? " plate--olive" : ""}${
        num ? " plate--numbered" : ""}`}
    >
      {num ? <span className="plate__num" aria-hidden="true">{num}</span> : null}
      <img
        className="plate__img"
        src={`/${src}`}
        alt={caption}
        style={pos ? ({ "--plate-pos": pos } as React.CSSProperties) : undefined}
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
