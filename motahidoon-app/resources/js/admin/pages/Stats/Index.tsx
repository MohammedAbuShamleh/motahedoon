import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, Empty, PageHeader } from "../../components/ui";

type Stats = {
  days: number;
  totals: { views: number; visitors: number; today: number };
  series: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  locales: { locale: string; views: number }[];
  sections: { path: string; section: string; views: number }[];
};

/* أسماء الأقسام المعروفة؛ غيرها يظهر بمعرّفه */
const SECTION: Record<string, string> = {
  hero: "الافتتاحية", about: "من نحن", videos: "مكتبة الفيديو", partners: "المؤسسات الشريكة",
  fields: "مجالات العمل", field: "من الميدان", impact: "لمحة أثر", reports: "التقارير", support: "الدعم والتواصل",
  period: "إنجازات الفترة", "rp-metrics": "أبرز المؤشرات", "rp-summary": "جدول الملخص", "rp-reading": "القراءة",
  "rp-notes": "ملاحظات البيانات", "rp-opps": "الفرص", "rp-appeal": "النداء", "rp-closing": "الخاتمة",
};
const PAGE = (path: string): string => {
  if (path === "/") return "الرئيسية";
  if (path === "/about") return "التعريف الكامل";
  if (path === "/videos") return "مكتبة الفيديو";
  if (path.startsWith("/videos/")) return `ألبوم: ${path.slice(8)}`;
  if (path === "/reports") return "الإنجازات";
  if (path.startsWith("/reports/")) return `تقرير: ${path.slice(9)}`;
  if (path.startsWith("/p/")) return `مجال: ${path.slice(3)}`;
  return path;
};
const LANG: Record<string, string> = { ar: "العربية", en: "الإنجليزية", tr: "التركية" };
const RANGES = [7, 30, 90, 365];
const fmt = (n: number) => n.toLocaleString("ar-EG-u-nu-latn");

function Tile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-rule bg-paper p-4">
      <p className="text-xs font-bold text-ink/60">{label}</p>
      <p className="mt-1 text-3xl font-black tabular-nums" dir="ltr">{fmt(value)}</p>
      {hint && <p className="mt-0.5 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

/** المشاهدات يومياً: أعمدة رفيعة بلون واحد، وتلميح لكلّ يوم بالمشاهدات والزوّار */
function DailyBars({ series }: { series: Stats["series"] }) {
  const [hot, setHot] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((d) => d.views));
  const cur = hot === null ? null : series[hot];
  return (
    <div>
      <div className="mb-2 h-5 text-sm" aria-live="polite">
        {cur
          ? <span><b dir="ltr">{cur.day}</b> — {fmt(cur.views)} مشاهدة · {fmt(cur.visitors)} زائر</span>
          : <span className="text-ink/50">مرّر المؤشّر على يوم لرؤية أرقامه</span>}
      </div>
      <div className="relative flex h-44 items-end gap-[2px] border-b border-ink/20" dir="ltr" role="img"
        aria-label={`المشاهدات اليومية لآخر ${series.length} يوماً`} onMouseLeave={() => setHot(null)}>
        {/* خطّا شبكة باهتان عند النصف والقمّة */}
        <span className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink/10" />
        <span className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-ink/10" />
        <span className="absolute -top-5 left-0 text-[11px] text-ink/45 tabular-nums">{fmt(max)}</span>
        {series.map((d, i) => (
          <button key={d.day} type="button" onMouseEnter={() => setHot(i)} onFocus={() => setHot(i)}
            aria-label={`${d.day}: ${d.views} مشاهدة، ${d.visitors} زائر`}
            className="group relative flex h-full flex-1 items-end focus:outline-none">
            <span className={`block w-full rounded-t-[4px] transition-colors ${hot === i ? "bg-ink" : "bg-green"}`}
              style={{ height: d.views ? `${Math.max(2, (d.views / max) * 100)}%` : "0" }} />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-ink/45 tabular-nums" dir="ltr">
        <span>{series[0]?.day}</span><span>{series[series.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export default function Index({ stats: s }: { stats: Stats }) {
  const pagesWithSections = Array.from(new Set(s.sections.map((x) => x.path)));

  return (
    <AdminLayout>
      <Head title="الإحصاءات" />
      <PageHeader
        title="إحصاءات الزيارات"
        subtitle="عدّ مجمّع بلا بيانات شخصية: لا عناوين IP ولا ملفّات تعريف. الزائر الفريد يُعدّ مرّة في الصفحة في اليوم، ولا تُعدّ برامج الزحف ولا صفحات اللوحة."
        actions={
          <div className="flex gap-1 rounded-lg border border-rule bg-paper p-1">
            {RANGES.map((d) => (
              <Link key={d} href={`/admin/stats?days=${d}`} preserveScroll
                className={`rounded-md px-3 py-1.5 text-sm font-bold transition ${s.days === d ? "bg-ink text-paper" : "text-ink/70 hover:bg-rule/40"}`}>
                {d === 365 ? "سنة" : `${d} يوماً`}
              </Link>
            ))}
          </div>
        }
      />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="المشاهدات" value={s.totals.views} hint={`آخر ${s.days} يوماً`} />
          <Tile label="الزوّار (فريدون يومياً لكلّ صفحة)" value={s.totals.visitors} hint={`آخر ${s.days} يوماً`} />
          <Tile label="مشاهدات اليوم" value={s.totals.today} />
        </div>

        <Card title="المشاهدات يومياً">
          {s.totals.views === 0 ? <Empty>لا زيارات مسجّلة في هذه المدّة بعد.</Empty> : <DailyBars series={s.series} />}
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="الصفحات" className="lg:col-span-2" flush>
            {s.pages.length === 0 ? <div className="p-5"><Empty>لا بيانات بعد.</Empty></div> : (
              <table className="w-full text-sm">
                <thead className="text-xs text-ink/60">
                  <tr className="border-b border-rule">
                    <th className="px-5 py-2.5 text-start font-bold">الصفحة</th>
                    <th className="px-3 py-2.5 text-end font-bold">مشاهدات</th>
                    <th className="px-5 py-2.5 text-end font-bold">زوّار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {s.pages.map((p) => (
                    <tr key={p.path}>
                      <td className="px-5 py-2.5">
                        <span className="font-bold">{PAGE(p.path)}</span>
                        <span className="ms-2 text-xs text-ink/45" dir="ltr">{p.path}</span>
                      </td>
                      <td className="px-3 py-2.5 text-end tabular-nums">{fmt(p.views)}</td>
                      <td className="px-5 py-2.5 text-end tabular-nums">{fmt(p.visitors)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card title="اللغات">
            {s.locales.length === 0 ? <Empty>لا بيانات بعد.</Empty> : (
              <ul className="space-y-3">
                {s.locales.map((l) => {
                  const pct = s.totals.views ? Math.round((l.views / s.totals.views) * 100) : 0;
                  return (
                    <li key={l.locale}>
                      <div className="flex justify-between text-sm"><span className="font-bold">{LANG[l.locale] ?? l.locale}</span><span className="tabular-nums text-ink/70">{fmt(l.views)} · {pct}%</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-rule/60"><div className="h-full rounded-full bg-green" style={{ width: `${pct}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card title="الأقسام التي شوهدت" flush>
          <p className="px-5 pt-4 text-xs leading-6 text-ink/60">يُعدّ القسم مرّة في الزيارة حين يظهر معظمه على الشاشة — فيبيّن إلى أين يصل الزوّار في كلّ صفحة.</p>
          {pagesWithSections.length === 0 ? <div className="p-5"><Empty>لا بيانات بعد.</Empty></div> : (
            <div className="grid gap-x-8 gap-y-6 p-5 md:grid-cols-2">
              {pagesWithSections.map((path) => {
                const rows = s.sections.filter((x) => x.path === path);
                const top = Math.max(1, ...rows.map((r) => r.views));
                return (
                  <div key={path}>
                    <p className="mb-2 text-sm font-bold">{PAGE(path)} <span className="text-xs font-normal text-ink/45" dir="ltr">{path}</span></p>
                    <ul className="space-y-1.5">
                      {rows.map((r) => (
                        <li key={r.section} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3 text-sm">
                          <span className="truncate">{SECTION[r.section] ?? r.section}</span>
                          <span className="h-1.5 rounded-full bg-rule/60"><span className="block h-full rounded-full bg-green" style={{ width: `${(r.views / top) * 100}%` }} /></span>
                          <span className="tabular-nums text-ink/70">{fmt(r.views)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
