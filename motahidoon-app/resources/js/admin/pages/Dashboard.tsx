import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../components/AdminLayout";
import { Glyph, type GlyphName } from "../components/icons";
import { Card, LinkButton, LocaleTag, PageHeader } from "../components/ui";

type Props = {
  counts: { partners: number; pillars: number; reports: number; media: number };
  current: string | null;
  translations: { locale: string; status: string; label: string; n: number }[];
  emptyPillarDefinitions: number;
};

/* البداية: أرقام المحتوى على شريط حبري كـ«لمحة أثر» في الموقع (خطّ أخضر
   أعلى كل رقم)، ثم طابور الترجمة والخانات المنتظرة. */
export default function Dashboard({ counts, current, translations, emptyPillarDefinitions }: Props) {
  const tiles: { label: string; n: number; href: string; icon: GlyphName }[] = [
    { label: "المؤسسات الشريكة", n: counts.partners, href: "/admin/partners", icon: "partners" },
    { label: "مجالات العمل", n: counts.pillars, href: "/admin/pillars", icon: "pillars" },
    { label: "التقارير", n: counts.reports, href: "/admin/reports", icon: "reports" },
    { label: "ملفات المكتبة", n: counts.media, href: "/admin/media", icon: "media" },
  ];

  return (
    <AdminLayout>
      <Head title="البداية" />
      <PageHeader title="البداية" subtitle={current ? `التقرير الحالي: ${current}` : "لا تقرير حالياً"} />

      <section aria-label="أرقام المحتوى" className="overflow-hidden rounded-xl bg-ink text-paper">
        <ul className="grid gap-px bg-paper/10 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <li key={t.href} className="bg-ink">
              <Link href={t.href} className="group flex h-full flex-col gap-4 border-t-2 border-green p-6 transition hover:bg-paper/[0.04]">
                <span className="flex items-center justify-between text-paper/55">
                  <Glyph name={t.icon} className="size-5" />
                  <span aria-hidden="true" className="text-sm transition group-hover:-translate-x-1 group-hover:text-paper">←</span>
                </span>
                <span className="text-[2.6rem] font-black leading-none tabular-nums">{t.n}</span>
                <span className="text-sm font-semibold text-paper/75">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card flush title="طابور الترجمة" actions={<LinkButton href="/admin/translations" size="sm">فتح الطابور</LinkButton>}>
          {translations.length === 0 ? (
            <p className="p-5 text-sm text-ink/60">لا ترجمات بعد.</p>
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
                    <td className="px-5 py-3">{t.label}</td>
                    <td className="px-5 py-3 text-end font-black tabular-nums">{t.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="border-t border-rule px-5 py-3 text-xs leading-5 text-ink/60">تنويه «ترجمة غير معتمدة» أعلى الموقع يختفي تلقائياً حين تُعتمد كل ترجمات اللغة.</p>
        </Card>

        <Card title="خانات بانتظار اعتماد التجمّع" tone="red">
          <div className="flex items-start gap-4">
            <span className="text-[2.6rem] font-black leading-none tabular-nums">{emptyPillarDefinitions}</span>
            <p className="text-sm leading-7 text-ink/80">
              من المجالات بلا نصّ تعريفي. تظهر في الموقع خانةً محجوزة موسومة — لا تُملأ بنصّ مؤقّت
              ولا يُخترع لها بديل؛ تُكتب حين يعتمد التجمّع النصّ.
            </p>
          </div>
          <div className="mt-4"><LinkButton href="/admin/pillars" size="sm">مجالات العمل</LinkButton></div>
        </Card>
      </div>
    </AdminLayout>
  );
}
