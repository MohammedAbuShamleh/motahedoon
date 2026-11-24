import { useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { FigureFields, newFigure } from "./FigureFields";
import { Repeater } from "./Repeater";
import { RichEditor } from "./RichEditor";
import { TableEditor } from "./TableEditor";
import { TranslationFields } from "./TranslationFields";
import { Card, ErrorSummary, ErrorText, SubmitBar, TextField, Toggle, fileInputClass } from "./ui";
import { send, str } from "../lib/form";
import type { FigureRow, TableData, Translations } from "../types";

type ItemRow = { id?: number; term: string; body: string; is_recap: boolean };
type GroupRow = { id?: number; num: string; title: string; is_recap: boolean; items: ItemRow[] };
type BlockRow = { id?: number; title: string; note_term: string; note_body: string; figures: FigureRow[] };
type PhotoRow = { id?: number; media_id: number | null; url?: string; file: File | null; caption: string };

export type Section = {
  id: number; report: { id: number; label: string }; pillar: string; lead: string | null;
  groups: { id: number; num: string | null; title: string | null; is_recap: boolean; items: { id: number; term: string | null; body: string; is_recap: boolean }[] }[];
  blocks: { id: number; title: string; note_term: string | null; note_body: string | null; figures: (FigureRow & { id: number })[] }[];
  table: TableData | null;
  gallery: { id: number; media_id: number; url: string; caption: string }[];
  translations: Translations;
};

/**
 * محرّر قسم مجال داخل تقرير: الافتتاحية، والمجموعات، وكتل الأرقام، والجدول،
 * والمعرض. يُستعمل في صفحة القسم من التقرير وفي صفحة تفاصيل المجال، ويحفظ
 * إلى المسار نفسه في الحالتين.
 * النصوص الطويلة منسَّقة؛ الأرقام داخلها تبقى كما تُكتب حرفياً.
 */
export function SectionEditor({ section: s }: { section: Section }) {
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
    <>
      <ErrorSummary errors={e} />
      <form onSubmit={submit} className="space-y-6">
        <Card title="الافتتاحية">
          <RichEditor label="نصّ الافتتاحية" value={data.lead} onChange={(v) => setData("lead", v)} error={e.lead} />
        </Card>

        <Card title="المجموعات">
          <Repeater<GroupRow> items={data.groups} onChange={(g) => setData("groups", g)} addLabel="مجموعة"
            make={() => ({ num: "", title: "", is_recap: false, items: [] })}
            render={(g, update, gi) => (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[6rem_1fr_auto]">
                  <TextField label="الرقم" dir="ltr" value={g.num} onChange={(v) => update({ num: v })} />
                  <TextField label="العنوان" value={g.title} onChange={(v) => update({ title: v })} />
                  <div className="flex items-end pb-2"><Toggle label="ملخّص" checked={g.is_recap} onChange={(v) => update({ is_recap: v })} /></div>
                </div>
                <Repeater<ItemRow> compact items={g.items} onChange={(items) => update({ items })} addLabel="بند"
                  make={() => ({ term: "", body: "", is_recap: false })}
                  render={(it, upd, ii) => (
                    <div className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
                      <TextField label="عنوان (اختياري)" value={it.term} onChange={(v) => upd({ term: v })} />
                      <RichEditor label="النصّ" compact lazy={!!it.body} value={it.body} onChange={(v) => upd({ body: v })} error={e[`groups.${gi}.items.${ii}.body`]} />
                      <div className="flex items-end pb-2"><Toggle label="ملخّص" checked={it.is_recap} onChange={(v) => upd({ is_recap: v })} /></div>
                    </div>
                  )} />
              </div>
            )} />
        </Card>

        <Card title="مجموعات الأرقام">
          <Repeater<BlockRow> items={data.blocks} onChange={(b) => setData("blocks", b)} addLabel="مجموعة أرقام"
            make={() => ({ title: "", note_term: "", note_body: "", figures: [] })}
            render={(b, update, bi) => (
              <div className="space-y-3">
                <TextField label="عنوان المجموعة" value={b.title} onChange={(v) => update({ title: v })} error={e[`blocks.${bi}.title`]} />
                <Repeater<FigureRow> compact items={b.figures} onChange={(figures) => update({ figures })} make={newFigure} addLabel="رقم"
                  render={(f, upd, fi) => <FigureFields row={f} update={upd} errors={e} prefix={`blocks.${bi}.figures.${fi}`} />} />
                <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
                  <TextField label="عنوان الملاحظة" value={b.note_term} onChange={(v) => update({ note_term: v })} />
                  <RichEditor label="الملاحظة" compact lazy={!!b.note_body} value={b.note_body} onChange={(v) => update({ note_body: v })} />
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
                {p.file ? <img src={URL.createObjectURL(p.file)} alt="" className="aspect-square w-full rounded-lg border border-rule object-cover" />
                  : p.url ? <img src={p.url} alt="" className="aspect-square w-full rounded-lg border border-rule object-cover" />
                  : <div className="grid aspect-square place-items-center rounded-lg border border-dashed border-rule bg-paper text-xs text-ink/50">بلا صورة</div>}
                <div className="space-y-2">
                  <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="الصورة" onChange={(ev) => update({ file: ev.target.files?.[0] ?? null })} className={fileInputClass} />
                  {e[`gallery.${pi}.file`] && <ErrorText>{e[`gallery.${pi}.file`]}</ErrorText>}
                  <TextField label="وصف الصورة" value={p.caption} onChange={(v) => update({ caption: v })} error={e[`gallery.${pi}.caption`]} hint="بلا اسم مكان أو حيّ." />
                </div>
              </div>
            )} />
          <p className="mt-2 text-xs text-ink/60">الصور الجديدة تتحوّل تلقائياً إلى الأبيض والأسود عند الرفع.</p>
        </Card>

        <Card title="ترجمة الافتتاحية">
          <TranslationFields fields={[{ key: "lead", label: "الافتتاحية", rich: true }]} value={data.translations} onChange={(t) => setData("translations", t)} errors={e} />
          <p className="mt-3 text-xs leading-5 text-ink/60">في الصفحات الإنجليزية والتركية تظهر الافتتاحية والأرقام فقط، مع رابط «التفاصيل الكاملة بالعربية».</p>
        </Card>

        <SubmitBar processing={form.processing} />
      </form>
    </>
  );
}
