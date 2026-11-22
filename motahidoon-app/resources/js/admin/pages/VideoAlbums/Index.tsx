import { Head, Link } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Card, DeleteButton, Empty, IndexChip, LinkButton, PageHeader } from "../../components/ui";
import type { MediaBrief } from "../../types";

type Album = {
  id: number; slug: string; title: string; position: number; is_published: boolean;
  cover: MediaBrief; videos_count: number | null;
};

export default function Index({ albums }: { albums: Album[] }) {
  return (
    <AdminLayout>
      <Head title="مكتبة الفيديو" />
      <PageHeader
        title="مكتبة الفيديو"
        subtitle="ألبومات، في كلّ ألبوم مقاطع: روابط يوتيوب أو فيسبوك، أو ملفات مرفوعة. يعرض قسم الرئيسية المقاطع المميّزة ثم الأحدث."
        actions={
          <>
            <LinkButton href="/admin/video-albums/guide">كيف تعمل المكتبة؟</LinkButton>
            <LinkButton href="/admin/video-albums/create" variant="primary">+ ألبوم جديد</LinkButton>
          </>
        }
      />
      <Card flush>
        {albums.length === 0 ? <div className="p-5"><Empty>لا ألبومات بعد. أنشئ ألبوماً ثم أضف إليه مقاطعه.</Empty></div> : (
          <ul className="divide-y divide-rule">
            {albums.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                <IndexChip>{a.position}</IndexChip>
                {a.cover
                  ? <img src={a.cover.url} alt="" className="aspect-video w-20 shrink-0 rounded-md border border-rule bg-ink object-contain" />
                  : <span aria-hidden="true" className="aspect-video w-20 shrink-0 rounded-md border border-dashed border-rule bg-rule/20" />}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/video-albums/${a.id}/edit`} className="font-bold transition hover:text-green">{a.title}</Link>
                  <p className="mt-0.5 text-xs text-ink/55">
                    <span dir="ltr">{a.slug}</span> · {a.videos_count ?? 0} مقطع
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {!a.is_published && <Badge tone="red">مخفيّ عن الموقع</Badge>}
                  {(a.videos_count ?? 0) === 0 && <Badge>بلا مقاطع — لا يظهر</Badge>}
                </div>
                <div className="flex gap-2">
                  <LinkButton href={`/admin/video-albums/${a.id}/edit`} size="sm">تحرير</LinkButton>
                  <DeleteButton small url={`/admin/video-albums/${a.id}`} confirm="حذف الألبوم ومقاطعه كلّها نهائياً؟ لا يمكن التراجع." />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
}
