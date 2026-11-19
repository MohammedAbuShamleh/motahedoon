import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Card, DeleteButton, Empty, IndexChip, LinkButton, PageHeader } from "../../components/ui";
import type { MediaBrief } from "../../types";

type Partner = { id: number; slug: string; name: string; position: number; is_published: boolean; logo: MediaBrief; role: string | null };

export default function Index({ partners }: { partners: Partner[] }) {
  return (
    <AdminLayout>
      <Head title="المؤسسات الشريكة" />
      <PageHeader title="المؤسسات الشريكة" subtitle="يعرض الموقع كل المؤسسات المضافة هنا مهما كان عددها، وبالترتيب نفسه." actions={<LinkButton href="/admin/partners/create" variant="primary">+ إضافة مؤسسة</LinkButton>} />
      <Card flush>
        {partners.length === 0 ? <div className="p-5"><Empty>لا توجد مؤسسات بعد.</Empty></div> : (
          <ul className="divide-y divide-rule">
            {partners.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                <IndexChip>{p.position}</IndexChip>
                {p.logo
                  ? <img src={p.logo.url} alt="" className="size-12 shrink-0 rounded-lg border border-rule bg-paper object-contain p-1" />
                  : <span aria-hidden="true" className="size-12 shrink-0 rounded-lg border border-dashed border-rule bg-rule/20" />}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/partners/${p.id}/edit`} className="font-bold transition hover:text-green">{p.name}</Link>
                  <p className="mt-0.5 text-xs text-ink/55"><span dir="ltr">{p.slug}</span></p>
                </div>
                {(!p.is_published || p.role === null) && (
                  <div className="flex flex-wrap gap-1.5">
                    {!p.is_published && <Badge tone="red">مخفيّة عن الموقع</Badge>}
                    {p.role === null && <Badge>الدور لم يُعتمد بعد</Badge>}
                  </div>
                )}
                <div className="flex gap-2">
                  <LinkButton href={`/admin/partners/${p.id}/edit`} size="sm">تحرير</LinkButton>
                  <DeleteButton small url={`/admin/partners/${p.id}`} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}
