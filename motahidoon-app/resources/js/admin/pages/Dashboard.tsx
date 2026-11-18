import { Head } from "@inertiajs/react";
import { AdminLayout } from "../components/AdminLayout";
import { Card, LinkButton, PageHeader } from "../components/ui";

type Props = {
  counts: { partners: number; pillars: number; reports: number; media: number };
  current: string | null;
  translations: { locale: string; status: string; label: string; n: number }[];
  emptyPillarDefinitions: number;
};

export default function Dashboard({ counts, current, translations, emptyPillarDefinitions }: Props) {
  const tiles: [string, number, string][] = [
    ["المؤسسات الشريكة", counts.partners, "/admin/partners"],
    ["مجالات العمل", counts.pillars, "/admin/pillars"],
    ["التقارير", counts.reports, "/admin/reports"],
    ["ملفات المكتبة", counts.media, "/admin/media"],
  ];

  return (
    <AdminLayout>
      <Head title="البداية" />
      <PageHeader title="البداية" subtitle={current ? `التقرير الحالي: ${current}` : "لا تقرير حالياً"} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([label, n, href]) => (
          <a key={href} href={href} className="rounded-xl border border-rule bg-white p-5 transition hover:border-olive">
            <p className="text-sm text-ink/65">{label}</p>
            <p className="mt-1 text-3xl font-light text-olive">{n}</p>
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="طابور الترجمة" actions={<LinkButton href="/admin/translations">فتح الطابور</LinkButton>}>
          {translations.length === 0 ? (
            <p className="text-sm text-ink/60">لا ترجمات بعد.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-start text-ink/60"><th className="py-1 text-start">اللغة</th><th className="text-start">الحالة</th><th className="text-start">العدد</th></tr></thead>
              <tbody>
                {translations.map((t) => (
                  <tr key={`${t.locale}-${t.status}`} className="border-t border-rule">
                    <td className="py-2" dir="ltr">{t.locale.toUpperCase()}</td>
                    <td>{t.label}</td>
                    <td className="font-semibold">{t.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-xs text-ink/60">تنويه «ترجمة غير معتمدة» أعلى الموقع يختفي تلقائياً حين تُعتمد كل ترجمات اللغة.</p>
        </Card>

        <Card title="خانات بانتظار اعتماد التجمّع">
          <p className="text-sm leading-7">
            {emptyPillarDefinitions} من المجالات بلا نصّ تعريفي. تظهر في الموقع خانةً محجوزة موسومة — لا تُملأ بنصّ مؤقّت
            ولا يُخترع لها بديل؛ تُكتب حين يعتمد التجمّع النصّ.
          </p>
          <div className="mt-3"><LinkButton href="/admin/pillars">مجالات العمل</LinkButton></div>
        </Card>
      </div>
    </AdminLayout>
  );
}
