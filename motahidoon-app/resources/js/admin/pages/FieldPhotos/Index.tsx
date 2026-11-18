import { Head, router, useForm } from "@inertiajs/react";
import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Button, Card, DeleteButton, PageHeader } from "../../components/ui";
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

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  return (
    <AdminLayout>
      <Head title="صور الميدان" />
      <PageHeader title="صور الميدان" subtitle="شريط الصور في الصفحة الرئيسية. تُحوَّل أبيض وأسود عند الرفع — قرار هوية في الملف نفسه." />

      <Card title="رفع صور" className="mb-6">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => upload.setData("photos", Array.from(e.target.files ?? []))} className="text-sm" />
          <Button type="submit" disabled={upload.processing || upload.data.photos.length === 0}>رفع {upload.data.photos.length || ""}</Button>
          {Object.values(upload.errors)[0] && <p className="text-sm text-red">{Object.values(upload.errors)[0]}</p>}
        </form>
        <p className="mt-2 text-xs text-ink/60">لا وجوه أطفال قريبة، ولا اسم مكان أو حيّ، ولا شعار جهة خارجية.</p>
      </Card>

      <Card title={`الصور (${order.length})`} actions={dirty && <Button onClick={() => router.put("/admin/field-photos/order", { ids: order.map((p) => p.id) }, { preserveScroll: true })}>حفظ الترتيب</Button>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {order.map((p, i) => (
            <figure key={p.id} className="overflow-hidden rounded-lg border border-rule bg-white">
              {p.media && <img src={p.media.url} alt="" className="aspect-[4/3] w-full object-cover" />}
              <figcaption className="flex items-center justify-between gap-1 p-2">
                <span className="text-xs font-bold text-olive">{i + 1}</span>
                <span className="flex gap-1">
                  <Button variant="ghost" className="px-1.5 py-0.5 text-xs" onClick={() => move(i, -1)} aria-label="قبل">◀</Button>
                  <Button variant="ghost" className="px-1.5 py-0.5 text-xs" onClick={() => move(i, 1)} aria-label="بعد">▶</Button>
                  <DeleteButton small url={`/admin/field-photos/${p.id}`} label="✕" />
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}
