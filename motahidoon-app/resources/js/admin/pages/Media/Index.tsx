import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Button, Card, DeleteButton, PageHeader, Pagination, Toggle } from "../../components/ui";
import { send } from "../../lib/form";
import type { Paginated } from "../../types";

type Media = { id: number; url: string; path: string; mime: string | null; width: number | null; height: number | null; bytes: number | null; is_bw: boolean; uploaded: boolean };

const kb = (b: number | null) => (b === null ? "—" : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export default function Index({ media }: { media: Paginated<Media> }) {
  const form = useForm({ files: [] as File[], bw: true });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(form, "post", "/admin/media", () => form.reset());
  };

  return (
    <AdminLayout>
      <Head title="مكتبة الملفات" />
      <PageHeader title="مكتبة الملفات" subtitle="الملفات تُحفظ في public/uploads مباشرة. أصول الموقع الأصلية (assets/) لا تُحذف من هنا." />
      <Card title="رفع ملفات" className="mb-6">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-4">
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => form.setData("files", Array.from(e.target.files ?? []))} className="text-sm" />
          <Toggle label="أبيض وأسود (للصور الميدانية)" checked={form.data.bw} onChange={(v) => form.setData("bw", v)} hint="أطفئه للشعارات." />
          <Button type="submit" disabled={form.processing || form.data.files.length === 0}>رفع</Button>
        </form>
        {Object.values(form.errors)[0] && <p className="mt-2 text-sm text-red">{Object.values(form.errors)[0]}</p>}
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {media.data.map((m) => (
          <figure key={m.id} className="overflow-hidden rounded-lg border border-rule bg-white text-xs">
            {m.mime?.startsWith("image/") ? (
              <img src={m.url} alt="" className="aspect-square w-full bg-rule/30 object-contain" loading="lazy" width={m.width ?? undefined} height={m.height ?? undefined} />
            ) : (
              <a href={m.url} target="_blank" rel="noreferrer" className="grid aspect-square place-items-center bg-rule/30 font-bold text-olive">PDF</a>
            )}
            <figcaption className="space-y-1 p-2">
              <p className="truncate" dir="ltr" title={m.path}>{m.path.split("/").pop()}</p>
              <p className="text-ink/55">{m.width ? `${m.width}×${m.height} · ` : ""}{kb(m.bytes)}</p>
              <div className="flex items-center justify-between">
                {m.uploaded ? <Badge tone="olive">مرفوع</Badge> : <Badge>أصل</Badge>}
                {m.uploaded && <DeleteButton small url={`/admin/media/${m.id}`} label="✕" confirm="حذف الملف؟ يُرفض إن كان مستعملاً في المحتوى." />}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <Pagination links={media.meta?.links ?? []} />
    </AdminLayout>
  );
}
