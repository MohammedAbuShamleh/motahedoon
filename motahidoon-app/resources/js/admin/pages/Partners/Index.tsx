import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Card, DeleteButton, Empty, LinkButton, PageHeader } from "../../components/ui";
import type { MediaBrief } from "../../types";

type Partner = { id: number; slug: string; name: string; position: number; is_published: boolean; logo: MediaBrief; role: string | null };

export default function Index({ partners }: { partners: Partner[] }) {
  return (
    <AdminLayout>
      <Head title="المؤسسات الشريكة" />
      <PageHeader title="المؤسسات الشريكة" subtitle="لا عدد ثابت — الموقع يرسم ما هنا أيّاً كان عدده." actions={<LinkButton href="/admin/partners/create" variant="primary">+ شريك</LinkButton>} />
      <Card>
        {partners.length === 0 ? <Empty>لا شركاء بعد.</Empty> : (
          <ul className="divide-y divide-rule">
            {partners.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3">
                <span className="w-6 text-xs font-bold text-olive">{p.position}</span>
                {p.logo ? <img src={p.logo.url} alt="" className="size-12 rounded-md border border-rule object-contain p-1" /> : <span className="size-12 rounded-md bg-rule/50" />}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/partners/${p.id}/edit`} className="font-semibold hover:text-olive">{p.name}</Link>
                  <p className="text-xs text-ink/55" dir="ltr">{p.slug}</p>
                </div>
                {!p.is_published && <Badge tone="red">مخفي</Badge>}
                {p.role === null && <Badge>الدور بانتظار الاعتماد</Badge>}
                <LinkButton href={`/admin/partners/${p.id}/edit`}>تحرير</LinkButton>
                <DeleteButton url={`/admin/partners/${p.id}`} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}
