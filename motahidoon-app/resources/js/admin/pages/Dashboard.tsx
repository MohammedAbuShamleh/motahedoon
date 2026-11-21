import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../components/AdminLayout";
import { Glyph, type GlyphName } from "../components/icons";
import { Badge, Card, LinkButton, LocaleTag, PageHeader, statusTone } from "../components/ui";

type Props = {
  counts: { partners: number; pillars: number; reports: number; media: number };
  current: string | null;
  translations: { locale: string; status: string; label: string; n: number }[];
  emptyPillarDefinitions: number;
};

/* الرئيسية: أربع بطاقات أرقام بألوان الهوية (أخضر، زيتوني، حبري، وورقية
   بخطّ أخضر)، ثم حالة الترجمات والنصوص المنتظرة. النصّ على الأخضر ورقيّ
   كامل (5.2:1)؛ الشفافية تُنزله عن 4.5. */
type Tile = { label: string; n: number; href: string; icon: GlyphName; tone: string; sub: string; num: string };

export default function Dashboard({ counts, current, translations, emptyPillarDefinitions }: Props) {
  const tiles: Tile[] = [
    { label: "المؤسسات الشريكة", n: counts.partners, href: "/admin/partners", icon: "partners", tone: "bg-green text-paper", sub: "text-paper", num: "text-paper" },
    { label: "مجالات العمل", n: counts.pillars, href: "/admin/pillars", icon: "pillars", tone: "bg-olive text-paper", sub: "text-paper/85", num: "text-paper" },
    { label: "التقارير", n: counts.reports, href: "/admin/reports", icon: "reports", tone: "bg-ink text-paper", sub: "text-paper/75", num: "text-paper" },
    { label: "الصور والملفات", n: counts.media, href: "/admin/media", icon: "media", tone: "border border-rule border-t-[3px] border-t-green bg-paper text-ink", sub: "text-ink/65", num: "text-green" },
  ];

  return (
    <AdminLayout>
      <Head title="الرئيسية" />
      <PageHeader title="الرئيسية" subtitle={current ? `التقرير الحالي: ${current}` : "لا يوجد تقرير حالي بعد"} />

      <ul aria-label="أرقام المحتوى" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className={`group flex h-full flex-col gap-4 rounded-xl p-6 shadow-[0_1px_2px_rgba(26,26,26,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(26,26,26,.45)] ${t.tone}`}>
              <span className={`flex items-center justify-between ${t.sub}`}>
                <Glyph name={t.icon} className="size-5" />
                <span aria-hidden="true" className="text-sm transition group-hover:-translate-x-1">←</span>
              </span>
              <span className={`text-[2.6rem] font-black leading-none tabular-nums ${t.num}`}>{t.n}</span>
              <span className={`text-sm font-bold ${t.sub}`}>{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card flush title="حالة الترجمات" actions={<LinkButton href="/admin/translations" size="sm">مراجعة الترجمات</LinkButton>}>
          {translations.length === 0 ? (
            <p className="p-5 text-sm text-ink/60">لا توجد ترجمات بعد.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-rule/40 text-xs text-ink/65">
                <tr>
                  <th className="px-5 py-2.5 text-start font-bold">اللغة</th>
                  <th className="px-5 py-2.5 text-start font-bold">الحالة</th>
                  <th className="px-5 py-2.5 text-end font-bold">العدد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {translations.map((t) => (
                  <tr key={`${t.locale}-${t.status}`}>
                    <td className="px-5 py-3"><LocaleTag locale={t.locale} /></td>
                    <td className="px-5 py-3"><Badge tone={statusTone(t.status)}>{t.label}</Badge></td>
                    <td className="px-5 py-3 text-end font-black tabular-nums">{t.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="border-t border-rule px-5 py-3 text-xs leading-5 text-ink/60">يظهر أعلى الموقع تنويه «ترجمة غير معتمدة» ما دامت في اللغة ترجمات لم تُعتمد، ويختفي تلقائياً حين تُعتمد كلّها.</p>
        </Card>

        <Card title="نصوص بانتظار اعتماد التجمّع" tone="red">
          <div className="flex items-start gap-4">
            <span className="text-[2.6rem] font-black leading-none tabular-nums text-red">{emptyPillarDefinitions}</span>
            <p className="text-sm leading-7 text-ink/80">
              من مجالات العمل بلا نصّ تعريفي حتى الآن. تظهر في الموقع بعبارة «بانتظار اعتماد التجمع» إلى أن يعتمد
              التجمّع نصّها؛ لا تكتب مكانها نصّاً مؤقّتاً.
            </p>
          </div>
          <div className="mt-4"><LinkButton href="/admin/pillars" size="sm">مجالات العمل</LinkButton></div>
        </Card>
      </div>
    </AdminLayout>
  );
}
