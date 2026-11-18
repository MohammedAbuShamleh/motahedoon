import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Card, DeleteButton, Empty, LinkButton, PageHeader } from "../../components/ui";

type Report = { id: number; slug: string; label: string; range: string; status: "draft" | "published"; is_current: boolean; sections_count: number };

export default function Index({ reports }: { reports: Report[] }) {
  return (
    <AdminLayout>
      <Head title="التقارير الربعية" />
      <PageHeader title="التقارير الربعية" subtitle="الحاشية: كل رقم هنا موسوم بفترته. الأحدث نشراً أولاً." actions={<LinkButton href="/admin/reports/create" variant="primary">+ تقرير</LinkButton>} />
      <Card>
        {reports.length === 0 ? <Empty>لا تقارير بعد.</Empty> : (
          <ul className="divide-y divide-rule">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/reports/${r.id}/edit`} className="font-bold hover:text-olive">{r.label}</Link>
                  <p className="text-xs text-ink/60">{r.range} · {r.sections_count} أقسام</p>
                </div>
                {r.is_current && <Badge tone="green">الحالي</Badge>}
                <Badge tone={r.status === "published" ? "olive" : "neutral"}>{r.status === "published" ? "منشور" : "مسودّة"}</Badge>
                <LinkButton href={`/admin/reports/${r.id}/edit`}>تحرير</LinkButton>
                <DeleteButton url={`/admin/reports/${r.id}`} confirm="حذف التقرير بكل أقسامه وأرقامه وترجماته؟ لا تراجع." />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}
