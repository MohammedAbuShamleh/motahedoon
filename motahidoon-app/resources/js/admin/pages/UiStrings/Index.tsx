import { Head, useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Button, Card, DeleteButton, PageHeader, TextField } from "../../components/ui";
import type { Translations } from "../../types";

type Str = { id: number; key: string; translations: Translations };

function Row({ s }: { s: Str }) {
  const form = useForm({ translations: s.translations });
  const set = (l: "en" | "tr", v: string) => form.setData("translations", { ...form.data.translations, [l]: { value: v } });

  return (
    <li className="grid items-end gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_1fr_auto]">
      <p className="pb-2.5 text-sm font-bold">{s.key}</p>
      <TextField label="English" dir="ltr" value={form.data.translations.en.value ?? ""} onChange={(v) => set("en", v)} />
      <TextField label="Türkçe" dir="ltr" value={form.data.translations.tr.value ?? ""} onChange={(v) => set("tr", v)} />
      <div className="flex gap-2 pb-px">
        {form.isDirty && <Button onClick={() => form.put(`/admin/ui-strings/${s.id}`, { preserveScroll: true })} disabled={form.processing}>حفظ</Button>}
        <DeleteButton url={`/admin/ui-strings/${s.id}`} confirm="حذف النصّ؟ إن كان الكود يطلبه سيظهر بالعربية في الصفحات الأجنبية." />
      </div>
    </li>
  );
}

export default function Index({ strings }: { strings: Str[] }) {
  const [q, setQ] = useState("");
  const add = useForm({ key: "", translations: { en: { value: "" }, tr: { value: "" } } });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    add.post("/admin/ui-strings", { preserveScroll: true, onSuccess: () => add.reset() });
  };
  const list = strings.filter((s) => !q || s.key.includes(q) || Object.values(s.translations).some((t) => (t.value ?? "").toLowerCase().includes(q.toLowerCase())));

  return (
    <AdminLayout>
      <Head title="نصوص الواجهة" />
      <PageHeader title="نصوص الواجهة" subtitle="تسميات الأزرار والعناوين الثابتة. المفتاح هو النصّ العربي الذي يطلبه الكود." />
      <Card title="نصّ جديد" className="mb-5">
        <form onSubmit={submit} className="grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <TextField label="النصّ العربي (المفتاح)" value={add.data.key} onChange={(v) => add.setData("key", v)} error={add.errors.key} />
          <TextField label="English" dir="ltr" value={add.data.translations.en.value} onChange={(v) => add.setData("translations", { ...add.data.translations, en: { value: v } })} />
          <TextField label="Türkçe" dir="ltr" value={add.data.translations.tr.value} onChange={(v) => add.setData("translations", { ...add.data.translations, tr: { value: v } })} />
          <Button type="submit" disabled={add.processing}>إضافة</Button>
        </form>
      </Card>
      <Card flush title={`النصوص (${list.length})`}>
        <div className="border-b border-rule p-5"><TextField label="بحث" value={q} onChange={setQ} /></div>
        <ul className="divide-y divide-rule">{list.map((s) => <Row key={s.id} s={s} />)}</ul>
      </Card>
    </AdminLayout>
  );
}
