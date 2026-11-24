import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, DeleteButton, LinkButton, PageHeader } from "../../components/ui";
import type { MediaBrief } from "../../types";

type Pillar = { id: number; slug: string; num: string; short: string; title: string; definition: string | null; is_published: boolean; cover: MediaBrief };

/* بطاقة المجال: الغلاف (أبيض وأسود في الملف) ورقمه على وسم حبري في زاويته،
   ثم العنوان المختصر والوسوم، والأفعال في ذيل مفصول بشعرة. */
export default function Index({ pillars }: { pillars: Pillar[] }) {
  return (
    <AdminLayout>
      <Head title="مجالات العمل" />
      <PageHeader title="مجالات العمل" subtitle="المجال الذي لا صورة غلاف له لا يظهر في شرائح أعلى الصفحة الرئيسية، ولا يؤثّر ذلك على بقية الموقع." actions={<><LinkButton href="/admin/pillars/guide">كيف أضيف التفاصيل؟</LinkButton><LinkButton href="/admin/pillars/create" variant="primary">+ إضافة مجال</LinkButton></>} />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pillars.map((p) => (
          <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-rule bg-paper shadow-[0_1px_2px_rgba(26,26,26,.04)]">
            <div className="relative">
              {p.cover
                ? <img src={p.cover.url} alt="" className="aspect-video w-full object-cover" />
                : <div className="grid aspect-video place-items-center bg-rule/40 text-xs text-ink/50">بلا صورة غلاف</div>}
              <span className="absolute start-3 top-3 grid h-8 min-w-8 place-items-center rounded-md bg-green px-2 text-sm font-black tabular-nums text-paper">{p.num}</span>
            </div>
            <div className="flex flex-1 flex-col border-t-[3px] border-olive p-4">
              <Link href={`/admin/pillars/${p.id}/details`} className="font-bold leading-7 transition hover:text-green">{p.short}</Link>
              {(p.definition === null || !p.is_published) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.definition === null && <Badge>التعريف لم يُعتمد بعد</Badge>}
                  {!p.is_published && <Badge tone="red">مخفيّ عن الموقع</Badge>}
                </div>
              )}
              <div className="flex-1" />
              <div className="mt-4 flex gap-2 border-t border-rule pt-4">
                <LinkButton href={`/admin/pillars/${p.id}/details`} size="sm" variant="primary">التفاصيل والحصيلة</LinkButton>
                <LinkButton href={`/admin/pillars/${p.id}/edit`} size="sm">البيانات الأساسية</LinkButton>
                <DeleteButton small url={`/admin/pillars/${p.id}`} confirm="حذف المجال؟ يُرفض إن كانت له أقسام في تقارير." />
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminLayout>
  );
}
