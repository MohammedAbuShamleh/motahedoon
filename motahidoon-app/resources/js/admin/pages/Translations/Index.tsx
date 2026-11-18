import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Button, Card, PageHeader, Pagination, Select, TextField } from "../../components/ui";
import type { Paginated, SharedProps } from "../../types";

type Row = { id: number; type: string; field: string; locale: string; status: string; status_label: string; value: string; source: string | null };
type Props = {
  translations: Paginated<Row>;
  filters: { locale?: string; status?: string; type?: string; q?: string };
  types: Record<string, string>;
  statuses: Record<string, string>;
};

function RowEditor({ row, selectable, selected, onSelect }: { row: Row; selectable: boolean; selected: boolean; onSelect: (v: boolean) => void }) {
  const form = useForm({ value: row.value });
  const tone = row.status === "approved" ? "green" : row.status === "pending" ? "olive" : "neutral";

  return (
    <li className="grid gap-3 py-4 md:grid-cols-[auto_1fr_1fr]">
      <div className="pt-1">{selectable && <input type="checkbox" className="size-4 accent-olive" checked={selected} onChange={(e) => onSelect(e.target.checked)} aria-label="تحديد" />}</div>
      <div>
        <div className="mb-1 flex flex-wrap gap-1.5 text-xs">
          <Badge>{row.type}</Badge><Badge>{row.field}</Badge><Badge tone={tone}>{row.status_label}</Badge>
        </div>
        <p className="text-sm leading-7 text-ink/80">{row.source ?? "—"}</p>
      </div>
      <form dir="ltr" className="space-y-2" onSubmit={(e) => { e.preventDefault(); form.put(`/admin/translations/${row.id}`, { preserveScroll: true }); }}>
        <div className="flex items-center gap-2 text-xs font-bold text-olive">{row.locale.toUpperCase()}</div>
        <textarea rows={Math.min(6, Math.max(2, Math.ceil(row.value.length / 70)))} value={form.data.value} onChange={(e) => form.setData("value", e.target.value)}
          className="w-full rounded-lg border border-rule bg-white px-3 py-2 text-sm leading-6 focus:border-olive focus:outline-none" />
        {form.errors.value && <p className="text-xs text-red">{form.errors.value}</p>}
        {form.isDirty && <Button type="submit" disabled={form.processing} className="px-3 py-1 text-xs">حفظ</Button>}
      </form>
    </li>
  );
}

export default function Index({ translations, filters, types, statuses }: Props) {
  const role = usePage<SharedProps>().props.auth?.role;
  const [f, setF] = useState({ locale: filters.locale ?? "", status: filters.status ?? "", type: filters.type ?? "", q: filters.q ?? "" });
  const [selected, setSelected] = useState<number[]>([]);
  const isAdmin = role === "admin";
  const apply = (next = f) => router.get("/admin/translations", Object.fromEntries(Object.entries(next).filter(([, v]) => v)), { preserveState: true });

  return (
    <AdminLayout>
      <Head title="طابور الترجمات" />
      <PageHeader title="طابور الترجمات" subtitle="تعديل ترجمة يجعلها «بانتظار المراجعة». الاعتماد للمدير وحده." />
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-5">
          <Select label="اللغة" value={f.locale} onChange={(v) => { const n = { ...f, locale: v }; setF(n); apply(n); }} options={{ "": "الكل", en: "English", tr: "Türkçe" }} />
          <Select label="الحالة" value={f.status} onChange={(v) => { const n = { ...f, status: v }; setF(n); apply(n); }} options={{ "": "الكل", ...statuses }} />
          <Select label="النوع" value={f.type} onChange={(v) => { const n = { ...f, type: v }; setF(n); apply(n); }} options={{ "": "الكل", ...types }} />
          <TextField className="md:col-span-2" label="بحث في الترجمة" dir="ltr" value={f.q} onChange={(v) => setF({ ...f, q: v })} />
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={() => apply()}>بحث</Button>
          {isAdmin && selected.length > 0 && (
            <Button onClick={() => router.post("/admin/translations/approve", { ids: selected }, { preserveScroll: true, onSuccess: () => setSelected([]) })}>
              اعتماد المحدّد ({selected.length})
            </Button>
          )}
          {isAdmin && (
            <Button variant="ghost" onClick={() => setSelected(translations.data.filter((t) => t.status !== "approved").map((t) => t.id))}>تحديد غير المعتمد في الصفحة</Button>
          )}
        </div>
      </Card>
      <Card>
        <p className="mb-2 text-xs text-ink/60">{translations.meta?.total ?? translations.data.length} ترجمة</p>
        <ul className="divide-y divide-rule">
          {translations.data.map((row) => (
            <RowEditor key={row.id} row={row} selectable={isAdmin && row.status !== "approved"} selected={selected.includes(row.id)}
              onSelect={(v) => setSelected((s) => (v ? [...s, row.id] : s.filter((x) => x !== row.id)))} />
          ))}
        </ul>
        <Pagination links={translations.meta?.links ?? []} />
      </Card>
    </AdminLayout>
  );
}
