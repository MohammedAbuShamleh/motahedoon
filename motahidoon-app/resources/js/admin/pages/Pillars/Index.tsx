import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Card, DeleteButton, LinkButton, PageHeader } from "../../components/ui";
import type { MediaBrief } from "../../types";

type Pillar = { id: number; slug: string; num: string; short: string; title: string; definition: string | null; is_published: boolean; cover: MediaBrief };

export default function Index({ pillars }: { pillars: Pillar[] }) {
  return (
    <AdminLayout>
      <Head title="مجالات العمل" />
      <PageHeader title="مجالات العمل" subtitle="مجال بلا غلاف لا شريحة له في سلايدر الافتتاحية — ولا يكسر شيئاً." actions={<LinkButton href="/admin/pillars/create" variant="primary">+ مجال</LinkButton>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p) => (
          <Card key={p.id} className="flex flex-col">
            {p.cover ? <img src={p.cover.url} alt="" className="mb-3 aspect-video w-full rounded-lg object-cover" /> : <div className="mb-3 grid aspect-video place-items-center rounded-lg bg-rule/50 text-xs text-ink/50">بلا غلاف</div>}
            <span className="text-2xl font-light text-olive">{p.num}</span>
            <Link href={`/admin/pillars/${p.id}/edit`} className="font-bold hover:text-olive">{p.short}</Link>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.definition === null && <Badge>التعريف بانتظار الاعتماد</Badge>}
              {!p.is_published && <Badge tone="red">مخفي</Badge>}
            </div>
            <div className="mt-auto flex gap-2 pt-4">
              <LinkButton href={`/admin/pillars/${p.id}/edit`}>تحرير</LinkButton>
              <DeleteButton url={`/admin/pillars/${p.id}`} confirm="حذف المجال؟ يُرفض إن كانت له أقسام في تقارير." />
            </div>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
