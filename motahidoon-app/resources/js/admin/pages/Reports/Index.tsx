import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Glyph } from "../../components/icons";
import { Badge, Card, DeleteButton, Empty, LinkButton, PageHeader } from "../../components/ui";

type Report = { id: number; slug: string; label: string; range: string; status: "draft" | "published"; is_current: boolean; sections_count: number };

export default function Index({ reports }: { reports: Report[] }) {
  return (
    <AdminLayout>
      <Head title="التقارير الربعية" />
      <PageHeader title="التقارير الربعية" subtitle="كل تقرير يغطّي فترة محدّدة، وأرقامه تخصّ تلك الفترة وحدها. الأحدث أولاً." actions={<><LinkButton href="/admin/pillars/guide">كيف أعدّل الأرباع؟</LinkButton><LinkButton href="/admin/reports/create" variant="primary">+ إضافة تقرير</LinkButton></>} />
      <Card flush>
        {reports.length === 0 ? <div className="p-5"><Empty>لا تقارير بعد.</Empty></div> : (
          <ul className="divide-y divide-rule">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${r.is_current ? "bg-green text-paper" : "bg-olive/10 text-olive"}`}><Glyph name="reports" className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/reports/${r.id}/edit`} className="font-bold transition hover:text-green">{r.label}</Link>
                  <p className="mt-0.5 text-xs text-ink/60">{r.range} · {r.sections_count} أقسام</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {r.is_current && <Badge tone="green">التقرير الحالي</Badge>}
                  <Badge tone={r.status === "published" ? "olive" : "neutral"}>{r.status === "published" ? "منشور" : "مسودّة"}</Badge>
                </div>
                <div className="flex gap-2">
                  <LinkButton href={`/admin/reports/${r.id}/edit`} size="sm">تحرير</LinkButton>
                  <DeleteButton small url={`/admin/reports/${r.id}`} confirm="حذف التقرير بكل أقسامه وأرقامه وترجماته؟ لا تراجع." />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}
