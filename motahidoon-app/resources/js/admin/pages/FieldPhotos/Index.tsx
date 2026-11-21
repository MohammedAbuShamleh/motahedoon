import { Head, router, useForm } from "@inertiajs/react";
import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Glyph } from "../../components/icons";
import { Button, Card, DeleteButton, ErrorText, IndexChip, PageHeader, fileInputClass } from "../../components/ui";
import { send } from "../../lib/form";
import type { MediaBrief } from "../../types";

type Photo = { id: number; media: MediaBrief };

export default function Index({ photos }: { photos: Photo[] }) {
  const [order, setOrder] = useState(photos);
  useEffect(() => setOrder(photos), [photos]);
  const dirty = order.some((p, i) => p.id !== photos[i]?.id);

  const upload = useForm({ photos: [] as File[] });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(upload, "post", "/admin/field-photos", () => upload.reset());
  };
  const error = Object.values(upload.errors)[0];

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  return (
    <AdminLayout>
      <Head title="الصور الميدانية" />
      <PageHeader title="الصور الميدانية" subtitle="صور قسم «من الميدان» في الصفحة الرئيسية. تتحوّل تلقائياً إلى الأبيض والأسود عند الرفع." />

      <Card title="رفع صور" className="mb-6">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-4">
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="الصور" onChange={(e) => upload.setData("photos", Array.from(e.target.files ?? []))} className={fileInputClass} />
          <Button type="submit" disabled={upload.processing || upload.data.photos.length === 0}>رفع {upload.data.photos.length || ""}</Button>
        </form>
        {error && <ErrorText className="mt-3">{error}</ErrorText>}
        <p className="mt-3 text-xs leading-5 text-ink/60">قبل الرفع تأكّد: لا وجوه أطفال قريبة، ولا اسم مكان أو حيّ، ولا شعار جهة خارجية.</p>
      </Card>

      <Card
        title={`الصور (${order.length})`}
        actions={dirty && <Button size="sm" onClick={() => router.put("/admin/field-photos/order", { ids: order.map((p) => p.id) }, { preserveScroll: true })}>حفظ الترتيب</Button>}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {order.map((p, i) => (
            <figure key={p.id} className="overflow-hidden rounded-lg border border-rule bg-paper">
              {p.media && <img src={p.media.url} alt="" className="aspect-4/3 w-full object-cover" />}
              <figcaption className="flex items-center justify-between gap-1 border-t border-rule p-2">
                <IndexChip>{i + 1}</IndexChip>
                {/* في الاتجاه العربي ما قبلُ على اليمين: «قبل» سهمه يمين و«بعد» يسار */}
                <span className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="تقديم الصورة" title="تقديم"><Glyph name="right" className="size-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="تأخير الصورة" title="تأخير"><Glyph name="left" className="size-4" /></Button>
                  <DeleteButton small url={`/admin/field-photos/${p.id}`} />
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}
