import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Button, Card, ErrorText, LOCALE_NAME, LocaleTag, PageHeader, Pagination, Select, TextField, inputClass, statusTone } from "../../components/ui";
import type { Paginated, SharedProps } from "../../types";

type Row = { id: number; type: string; field: string; locale: string; status: string; status_label: string; value: string; source: string | null };
type Props = {
  translations: Paginated<Row>;
  filters: { locale?: string; status?: string; type?: string; q?: string };
  types: Record<string, string>;
  statuses: Record<string, string>;
};

/** أسماء الحقول بالعربية — الخادم يرسل مفتاح الحقل البرمجي (unapproved_notice…). */
const FIELD_LABEL: Record<string, string> = {
  name: "الاسم", short_name: "الاسم المختصر", tagline: "العبارة التعريفية", vision: "الرؤية", mission: "الرسالة",
  media_office: "اسم المكتب الإعلامي", unapproved_notice: "تنويه «ترجمة غير معتمدة»",
  title: "العنوان", short: "العنوان المختصر", orgs: "الجهات المنفّذة", definition: "التعريف", cover_caption: "وصف الصورة",
  term: "العنوان", body: "النصّ", value: "النصّ",
  label: "اسم الفترة", range: "الفترة الزمنية", report_title: "عنوان التقرير", metrics_title: "عنوان المؤشّرات",
  lead: "الافتتاحية", stats: "الأرقام", unit: "الوحدة",
};

function RowEditor({ row, selectable, selected, onSelect }: { row: Row; selectable: boolean; selected: boolean; onSelect: (v: boolean) => void }) {
  const form = useForm({ value: row.value });
  const fieldLabel = FIELD_LABEL[row.field] ?? row.field;

  return (
    <li className="grid gap-4 px-5 py-5 md:grid-cols-[auto_1fr_1fr]">
      <div className="pt-1">{selectable && <input type="checkbox" className="size-4 cursor-pointer accent-green" checked={selected} onChange={(e) => onSelect(e.target.checked)} aria-label="تحديد للاعتماد" />}</div>
      <div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge>{row.type}</Badge><Badge>{fieldLabel}</Badge><Badge tone={statusTone(row.status)}>{row.status_label}</Badge>
        </div>
        <p className="text-sm leading-7 text-ink/80">{row.source ?? "—"}</p>
      </div>
      <form dir="ltr" className="space-y-2" onSubmit={(e) => { e.preventDefault(); form.put(`/admin/translations/${row.id}`, { preserveScroll: true }); }}>
        <LocaleTag locale={row.locale} />
        <textarea rows={Math.min(6, Math.max(2, Math.ceil(row.value.length / 70)))} value={form.data.value} onChange={(e) => form.setData("value", e.target.value)}
          aria-label={`${fieldLabel} — ${LOCALE_NAME[row.locale] ?? row.locale}`} aria-invalid={form.errors.value ? true : undefined} className={`${inputClass} leading-6`} />
        {form.errors.value && <ErrorText>{form.errors.value}</ErrorText>}
        {form.isDirty && <Button type="submit" size="sm" disabled={form.processing}>حفظ</Button>}
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
      <Head title="مراجعة الترجمات" />
      <PageHeader title="مراجعة الترجمات" subtitle="هنا تُعدَّل الترجمة الإنجليزية والتركية لنصوص الموقع. أيّ تعديل يجعل الترجمة «بانتظار المراجعة» حتى يعتمدها المدير." />
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-5">
          <Select label="اللغة" value={f.locale} onChange={(v) => { const n = { ...f, locale: v }; setF(n); apply(n); }} options={{ "": "كل اللغات", en: "الإنجليزية", tr: "التركية" }} />
          <Select label="الحالة" value={f.status} onChange={(v) => { const n = { ...f, status: v }; setF(n); apply(n); }} options={{ "": "كل الحالات", ...statuses }} />
          <Select label="النوع" value={f.type} onChange={(v) => { const n = { ...f, type: v }; setF(n); apply(n); }} options={{ "": "كل الأنواع", ...types }} />
          <TextField className="md:col-span-2" label="بحث في الترجمة" dir="ltr" value={f.q} onChange={(v) => setF({ ...f, q: v })} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => apply()}>بحث</Button>
          {isAdmin && selected.length > 0 && (
            <Button onClick={() => router.post("/admin/translations/approve", { ids: selected }, { preserveScroll: true, onSuccess: () => setSelected([]) })}>
              اعتماد المحدّد ({selected.length})
            </Button>
          )}
          {isAdmin && (
            <Button variant="ghost" onClick={() => setSelected(translations.data.filter((t) => t.status !== "approved").map((t) => t.id))}>تحديد كل غير المعتمد في هذه الصفحة</Button>
          )}
        </div>
      </Card>
      <Card flush title={`${translations.meta?.total ?? translations.data.length} ترجمة`}>
        <ul className="divide-y divide-rule">
          {translations.data.map((row) => (
            <RowEditor key={row.id} row={row} selectable={isAdmin && row.status !== "approved"} selected={selected.includes(row.id)}
              onSelect={(v) => setSelected((s) => (v ? [...s, row.id] : s.filter((x) => x !== row.id)))} />
          ))}
        </ul>
        {(translations.meta?.links.length ?? 0) > 3 && (
          <div className="border-t border-rule px-5 pb-5"><Pagination links={translations.meta?.links ?? []} /></div>
        )}
      </Card>
    </AdminLayout>
  );
}
