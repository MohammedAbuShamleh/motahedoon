import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FigureFields, newFigure } from "../../components/FigureFields";
import { Repeater } from "../../components/Repeater";
import { TableEditor } from "../../components/TableEditor";
import { TranslationFields } from "../../components/TranslationFields";
import { Card, ErrorSummary, LinkButton, PageHeader, SubmitBar, TextArea, TextField, Toggle } from "../../components/ui";
import { send, str } from "../../lib/form";
import type { FigureRow, TableData, Translations } from "../../types";

type ItemRow = { id?: number; term: string; body: string; is_recap: boolean };
type GroupRow = { id?: number; num: string; title: string; is_recap: boolean; items: ItemRow[] };
type BlockRow = { id?: number; title: string; note_term: string; note_body: string; figures: FigureRow[] };
type PhotoRow = { id?: number; media_id: number | null; url?: string; file: File | null; caption: string };

type Section = {
  id: number; report: { id: number; label: string }; pillar: string; lead: string | null;
  groups: { id: number; num: string | null; title: string | null; is_recap: boolean; items: { id: number; term: string | null; body: string; is_recap: boolean }[] }[];
  blocks: { id: number; title: string; note_term: string | null; note_body: string | null; figures: (FigureRow & { id: number })[] }[];
  table: TableData | null;
  gallery: { id: number; media_id: number; url: string; caption: string }[];
  translations: Translations;
};

export default function SectionPage({ section: s }: { section: Section }) {
  const form = useForm({
    lead: str(s.lead),
    groups: s.groups.map((g) => ({ id: g.id, num: str(g.num), title: str(g.title), is_recap: g.is_recap,
      items: g.items.map((i) => ({ id: i.id, term: str(i.term), body: i.body, is_recap: i.is_recap })) })) as GroupRow[],
    blocks: s.blocks.map((b) => ({ id: b.id, title: b.title, note_term: str(b.note_term), note_body: str(b.note_body),
      figures: b.figures.map((f) => ({ ...f, prefix: str(f.prefix), unit: str(f.unit) })) })) as BlockRow[],
    table: s.table,
    gallery: s.gallery.map((g) => ({ id: g.id, media_id: g.media_id, url: g.url, file: null, caption: g.caption })) as PhotoRow[],
    translations: s.translations,
  });
  const { data, setData } = form;
  const e = form.errors as Record<string, string | undefined>;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    send(form, "put", `/admin/sections/${s.id}`);
  };

  return (
    <AdminLayout>
      <Head title={`${s.pillar} — ${s.report.label}`} />
      <PageHeader title={s.pillar} subtitle={`قسم في ${s.report.label}`} actions={<LinkButton href={`/admin/reports/${s.report.id}/edit`}>رجوع للتقرير</LinkButton>} />
      <ErrorSummary errors={e} />
      <form onSubmit={submit} className="space-y-6">
        <Card title="الافتتاحية">
          <TextArea label="نصّ الافتتاحية" rows={4} value={data.lead} onChange={(v) => setData("lead", v)} error={e.lead} />
        </Card>

        <Card title="المجموعات">
          <Repeater<GroupRow> items={data.groups} onChange={(g) => setData("groups", g)} addLabel="مجموعة"
            make={() => ({ num: "", title: "", is_recap: false, items: [] })}
            render={(g, update, gi) => (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[6rem_1fr_auto]">
                  <TextField label="الرقم" dir="ltr" value={g.num} onChange={(v) => update({ num: v })} />
                  <TextField label="العنوان" value={g.title} onChange={(v) => update({ title: v })} />
                  <div className="flex items-end pb-2"><Toggle label="خلاصة" checked={g.is_recap} onChange={(v) => update({ is_recap: v })} /></div>
                </div>
                <Repeater<ItemRow> compact items={g.items} onChange={(items) => update({ items })} addLabel="بند"
                  make={() => ({ term: "", body: "", is_recap: false })}
                  render={(it, upd, ii) => (
                    <div className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
                      <TextField label="مصطلح (اختياري)" value={it.term} onChange={(v) => upd({ term: v })} />
                      <TextArea label="النصّ" rows={2} value={it.body} onChange={(v) => upd({ body: v })} error={e[`groups.${gi}.items.${ii}.body`]} />
                      <div className="flex items-end pb-2"><Toggle label="خلاصة" checked={it.is_recap} onChange={(v) => upd({ is_recap: v })} /></div>
                    </div>
                  )} />
              </div>
            )} />
        </Card>

        <Card title="كتل الأرقام">
          <Repeater<BlockRow> items={data.blocks} onChange={(b) => setData("blocks", b)} addLabel="كتلة"
            make={() => ({ title: "", note_term: "", note_body: "", figures: [] })}
            render={(b, update, bi) => (
              <div className="space-y-3">
                <TextField label="عنوان الكتلة" value={b.title} onChange={(v) => update({ title: v })} error={e[`blocks.${bi}.title`]} />
                <Repeater<FigureRow> compact items={b.figures} onChange={(figures) => update({ figures })} make={newFigure} addLabel="رقم"
                  render={(f, upd, fi) => <FigureFields row={f} update={upd} errors={e} prefix={`blocks.${bi}.figures.${fi}`} />} />
                <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
                  <TextField label="مصطلح الملاحظة" value={b.note_term} onChange={(v) => update({ note_term: v })} />
                  <TextArea label="الملاحظة" rows={2} value={b.note_body} onChange={(v) => update({ note_body: v })} />
                </div>
              </div>
            )} />
        </Card>

        <Card title="الجدول">
          <TableEditor value={data.table} onChange={(t) => setData("table", t)} />
        </Card>

        <Card title="معرض الصور">
          <Repeater<PhotoRow> items={data.gallery} onChange={(g) => setData("gallery", g)} addLabel="صورة"
            make={() => ({ media_id: null, file: null, caption: "" })}
            render={(p, update, pi) => (
              <div className="grid items-start gap-3 sm:grid-cols-[8rem_1fr]">
                {p.file ? <img src={URL.createObjectURL(p.file)} alt="" className="aspect-square w-full rounded-md object-cover" />
                  : p.url ? <img src={p.url} alt="" className="aspect-square w-full rounded-md object-cover" />
                  : <div className="grid aspect-square place-items-center rounded-md bg-rule/50 text-xs">بلا صورة</div>}
                <div className="space-y-2">
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(ev) => update({ file: ev.target.files?.[0] ?? null })} className="text-xs" />
                  {e[`gallery.${pi}.file`] && <p className="text-xs text-red">{e[`gallery.${pi}.file`]}</p>}
                  <TextField label="التعليق" value={p.caption} onChange={(v) => update({ caption: v })} error={e[`gallery.${pi}.caption`]} hint="بلا اسم مكان أو حيّ." />
                </div>
              </div>
            )} />
          <p className="mt-2 text-xs text-ink/60">الصور الجديدة تُحوَّل أبيض وأسود عند الرفع.</p>
        </Card>

        <Card title="ترجمة الافتتاحية">
          <TranslationFields fields={[{ key: "lead", label: "Lead", multiline: true }]} value={data.translations} onChange={(t) => setData("translations", t)} errors={e} />
          <p className="mt-3 text-xs text-ink/60">في العرض الأجنبي تظهر الافتتاحية والأرقام وحدها، ورابط «التفاصيل الكاملة بالعربية».</p>
        </Card>

        <SubmitBar processing={form.processing} />
      </form>
    </AdminLayout>
  );
}
