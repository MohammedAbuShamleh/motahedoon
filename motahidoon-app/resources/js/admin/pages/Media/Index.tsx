import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Glyph } from "../../components/icons";
import { Badge, Button, Card, DeleteButton, ErrorText, PageHeader, Pagination, Toggle, fileInputClass } from "../../components/ui";
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
  const error = Object.values(form.errors)[0];

  return (
    <AdminLayout>
      <Head title="مكتبة الصور والملفات" />
      <PageHeader title="مكتبة الصور والملفات" subtitle="كل الصور والملفات المرفوعة للموقع. ملفات الموقع الأصلية (المعلَّمة «أصلي») لا تُحذف من هنا." />
      <Card title="رفع ملفات" className="mb-6">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" aria-label="الملفات" onChange={(e) => form.setData("files", Array.from(e.target.files ?? []))} className={fileInputClass} />
          <Toggle label="تحويلها إلى الأبيض والأسود (للصور الميدانية)" checked={form.data.bw} onChange={(v) => form.setData("bw", v)} hint="ألغِ التحديد عند رفع الشعارات." />
          <Button type="submit" disabled={form.processing || form.data.files.length === 0}>رفع</Button>
        </form>
        {error && <ErrorText className="mt-3">{error}</ErrorText>}
      </Card>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {media.data.map((m) => (
          <figure key={m.id} className="flex flex-col overflow-hidden rounded-xl border border-rule bg-paper text-xs shadow-[0_1px_2px_rgba(26,26,26,.04)]">
            {m.mime?.startsWith("image/") ? (
              <img src={m.url} alt="" className="aspect-square w-full bg-rule/25 object-contain p-2" loading="lazy" width={m.width ?? undefined} height={m.height ?? undefined} />
            ) : (
              <a href={m.url} target="_blank" rel="noreferrer" className="grid aspect-square place-items-center gap-1 bg-rule/25 font-black text-olive transition hover:text-ink">
                <span className="grid place-items-center gap-1.5"><Glyph name="reports" className="size-8" />PDF</span>
              </a>
            )}
            <figcaption className="flex flex-1 flex-col gap-1 border-t border-rule p-3">
              <p className="truncate text-end font-bold" dir="ltr" title={m.path}>{m.path.split("/").pop()}</p>
              <p className="tabular-nums text-ink/55">{m.width ? `${m.width}×${m.height} · ` : ""}{kb(m.bytes)}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                {m.uploaded ? <Badge tone="green">مرفوع</Badge> : <Badge tone="olive">أصلي</Badge>}
                {m.uploaded && <DeleteButton small url={`/admin/media/${m.id}`} confirm="حذف الملف؟ يُرفض إن كان مستعملاً في المحتوى." />}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <Pagination links={media.meta?.links ?? []} />
    </AdminLayout>
  );
}
