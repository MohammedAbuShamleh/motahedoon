import { Head, useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { TranslationFields } from "../../components/TranslationFields";
import { Button, Card, DeleteButton, ErrorSummary, PageHeader, TextArea, TextField } from "../../components/ui";
import { emptyTranslations, send, str } from "../../lib/form";
import type { Option, Translations } from "../../types";

type Line = { id: number; group: string; term: string | null; body: string; position: number; translations: Translations };

function LineForm({ line, group, onDone }: { line: Line | null; group: Option; onDone: () => void }) {
  const form = useForm({
    group: group.value,
    term: str(line?.term),
    body: line?.body ?? "",
    position: line ? String(line.position) : "",
    translations: line?.translations ?? emptyTranslations(["term", "body"]),
  });
  const e = form.errors as Record<string, string | undefined>;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (line) {
      form.transform(({ group: _g, ...rest }) => rest);
      form.put(`/admin/content-lines/${line.id}`, { preserveScroll: true, onSuccess: onDone });
    } else {
      send(form, "post", "/admin/content-lines", () => { form.reset(); onDone(); });
    }
  };

  const fields = group.hasTerm
    ? [{ key: "term", label: "Term" }, { key: "body", label: "Text", multiline: true }]
    : [{ key: "body", label: "Text", multiline: true }];

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorSummary errors={e} />
      <div className="grid gap-4 md:grid-cols-[1fr_8rem]">
        <div className="space-y-3">
          {group.hasTerm && <TextField label="المصطلح" value={form.data.term} onChange={(v) => form.setData("term", v)} error={e.term} />}
          <TextArea label="النصّ" value={form.data.body} onChange={(v) => form.setData("body", v)} error={e.body} rows={4} />
        </div>
        <TextField label="الترتيب" type="number" dir="ltr" value={form.data.position} onChange={(v) => form.setData("position", v)} hint="فارغ = آخر القائمة" />
      </div>
      <details className="rounded-lg border border-rule bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold">الترجمات</summary>
        <div className="mt-3"><TranslationFields fields={fields} value={form.data.translations} onChange={(t) => form.setData("translations", t)} errors={e} /></div>
      </details>
      <div className="flex gap-2">
        <Button type="submit" disabled={form.processing}>{line ? "حفظ" : "إضافة"}</Button>
        <Button variant="ghost" onClick={onDone}>إلغاء</Button>
      </div>
    </form>
  );
}

export default function Index({ lines, groups }: { lines: Line[]; groups: Option[] }) {
  const [active, setActive] = useState(groups[0].value);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const group = groups.find((g) => g.value === active)!;
  const list = lines.filter((l) => l.group === active);

  return (
    <AdminLayout>
      <Head title="القيم والأهداف والسرد" />
      <PageHeader title="القيم والأهداف والسرد" subtitle="أسطر المتن الدائم. الترتيب هنا هو ترتيب العرض في الموقع." />

      <div className="mb-5 flex flex-wrap gap-2" role="tablist">
        {groups.map((g) => (
          <button key={g.value} type="button" role="tab" aria-selected={g.value === active}
            onClick={() => { setActive(g.value); setEditing(null); }}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold ${g.value === active ? "bg-olive text-paper" : "border border-rule bg-white"}`}>
            {g.label} <span className="opacity-70">({lines.filter((l) => l.group === g.value).length})</span>
          </button>
        ))}
      </div>

      <Card title={group.label} actions={editing !== "new" && <Button onClick={() => setEditing("new")}>+ سطر جديد</Button>}>
        {editing === "new" && (
          <div className="mb-5 rounded-lg border border-olive/40 bg-olive/5 p-4">
            <LineForm key={`new-${active}`} line={null} group={group} onDone={() => setEditing(null)} />
          </div>
        )}
        <ol className="space-y-3">
          {list.map((l) => (
            <li key={l.id} className="rounded-lg border border-rule p-4">
              {editing === l.id ? (
                <LineForm line={l} group={group} onDone={() => setEditing(null)} />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-olive">#{l.position}</span>
                    {l.term && <p className="font-bold">{l.term}</p>}
                    <p className="text-sm leading-7 text-ink/80">{l.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" onClick={() => setEditing(l.id)}>تحرير</Button>
                    <DeleteButton url={`/admin/content-lines/${l.id}`} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </Card>
    </AdminLayout>
  );
}
