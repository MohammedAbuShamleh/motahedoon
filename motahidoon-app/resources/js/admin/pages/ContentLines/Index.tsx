import { Head, useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { TranslationFields } from "../../components/TranslationFields";
import { Button, Card, DeleteButton, Empty, ErrorSummary, IndexChip, PageHeader, TextArea, TextField } from "../../components/ui";
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
      <details className="rounded-lg border border-rule bg-rule/15 p-3">
        <summary className="cursor-pointer text-sm font-bold">الترجمات</summary>
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

      {/* المجموعات: مفتاح مقسّم بمربّعات ليّنة، والحالية حبرية */}
      <div className="mb-6 flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-rule bg-paper p-1" role="tablist" aria-label="مجموعات المتن">
        {groups.map((g) => {
          const on = g.value === active;
          return (
            <button key={g.value} type="button" role="tab" aria-selected={on}
              onClick={() => { setActive(g.value); setEditing(null); }}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${on ? "bg-ink text-paper" : "text-ink/70 hover:bg-rule/60 hover:text-ink"}`}>
              {g.label}
              <span className={`rounded-md px-1.5 text-xs tabular-nums ${on ? "bg-paper/15" : "bg-rule/70"}`}>{lines.filter((l) => l.group === g.value).length}</span>
            </button>
          );
        })}
      </div>

      <Card title={group.label} actions={editing !== "new" && <Button size="sm" onClick={() => setEditing("new")}>+ سطر جديد</Button>}>
        {editing === "new" && (
          <div className="mb-5 rounded-lg border border-olive/40 bg-olive/5 p-4">
            <LineForm key={`new-${active}`} line={null} group={group} onDone={() => setEditing(null)} />
          </div>
        )}
        {list.length === 0 && editing !== "new" && <Empty>لا أسطر في هذه المجموعة بعد.</Empty>}
        <ol className="space-y-3">
          {list.map((l) => (
            <li key={l.id} className="rounded-lg border border-rule bg-paper p-4">
              {editing === l.id ? (
                <LineForm line={l} group={group} onDone={() => setEditing(null)} />
              ) : (
                <div className="flex items-start gap-4">
                  <IndexChip>{l.position}</IndexChip>
                  <div className="min-w-0 flex-1">
                    {l.term && <p className="font-bold">{l.term}</p>}
                    <p className="text-sm leading-7 text-ink/80">{l.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(l.id)}>تحرير</Button>
                    <DeleteButton small url={`/admin/content-lines/${l.id}`} />
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
