import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FigureFields, newFigure } from "../../components/FigureFields";
import { Repeater } from "../../components/Repeater";
import { TableEditor } from "../../components/TableEditor";
import { TranslationFields } from "../../components/TranslationFields";
import { Button, Card, DeleteButton, ErrorSummary, ErrorText, FileField, IndexChip, LinkButton, PageHeader, Select, SubmitBar, TextArea, TextField, Toggle } from "../../components/ui";
import { emptyTranslations, send, str } from "../../lib/form";
import type { FigureRow, MediaBrief, Option, TableData, Translations } from "../../types";

type LineRow = { id?: number; term: string; body: string };

type Report = {
  id: number; slug: string; label: string; range: string; report_title: string; metrics_title: string;
  reading_title: string | null; data_notes_title: string | null; opportunities_title: string | null;
  closing_title: string | null; closing_signoff: string | null; appeal_title: string | null;
  appeal_lead: string | null; appeal_photo_caption: string | null; is_current: boolean; status: string;
  report_file: MediaBrief; appeal_photo: MediaBrief;
  lines: Record<string, { id: number; term: string | null; body: string }[]>;
  metrics: (FigureRow & { id: number })[];
  summary: TableData | null;
  sections: { id: number; pillar: string }[];
  translations: Translations;
};

type Props = { report: Report | null; lineGroups: Option[]; pillars: { id: number; short: string }[] };

/** أيّ أسطر تتبع أيّ عنوان اختياري في التقرير. */
const TITLED: Record<string, { title: string; label: string }> = {
  reading: { title: "reading_title", label: "عنوان «قراءة الأثر»" },
  data_note: { title: "data_notes_title", label: "عنوان «ملاحظات البيانات»" },
  opportunity: { title: "opportunities_title", label: "عنوان «فرص التطوير»" },
  closing_paragraph: { title: "closing_title", label: "عنوان «الخاتمة»" },
};

export default function Form({ report: r, lineGroups, pillars }: Props) {
  const form = useForm({
    slug: r?.slug ?? "", label: r?.label ?? "", range: r?.range ?? "", report_title: r?.report_title ?? "",
    metrics_title: r?.metrics_title ?? "", status: r?.status ?? "draft", is_current: r?.is_current ?? false,
    reading_title: str(r?.reading_title), data_notes_title: str(r?.data_notes_title),
    opportunities_title: str(r?.opportunities_title), closing_title: str(r?.closing_title),
    closing_signoff: str(r?.closing_signoff), appeal_title: str(r?.appeal_title), appeal_lead: str(r?.appeal_lead),
    appeal_photo_caption: str(r?.appeal_photo_caption),
    appeal_photo: null as File | null, remove_appeal_photo: false,
    report_file: null as File | null, remove_report_file: false,
    lines: Object.fromEntries(lineGroups.map((g) => [g.value, (r?.lines[g.value] ?? []).map((l) => ({ id: l.id, term: str(l.term), body: l.body }))])) as Record<string, LineRow[]>,
    metrics: (r?.metrics ?? []).map((m) => ({ ...m, prefix: str(m.prefix), unit: str(m.unit) })) as FigureRow[],
    summary: r?.summary ?? null,
    translations: r?.translations ?? emptyTranslations(["label", "range", "report_title", "metrics_title"]),
  });
  const { data, setData } = form;
  const e = form.errors as Record<string, string | undefined>;
  const [pillar, setPillar] = useState(String(pillars[0]?.id ?? ""));

  const titles = data as unknown as Record<string, string>;
  const setTitle = (key: string, v: string) => setData((d) => ({ ...d, [key]: v }));

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    send(form, r ? "put" : "post", r ? `/admin/reports/${r.id}` : "/admin/reports", () =>
      form.setData((d) => ({ ...d, appeal_photo: null, report_file: null })));
  };

  return (
    <AdminLayout>
      <Head title={r ? r.label : "تقرير جديد"} />
      <PageHeader title={r ? r.label : "تقرير جديد"} subtitle="الأرقام تُكتب كما في المصدر حرفياً: لا جمع، لا تقريب، لا اختصار." actions={<LinkButton href="/admin/reports">رجوع</LinkButton>} />
      <ErrorSummary errors={e} />

      <form onSubmit={submit} className="space-y-6">
        <Card title="بيانات التقرير">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField label="التسمية" value={data.label} onChange={(v) => setData("label", v)} error={e.label} hint="الربع الثالث 2026" />
            <TextField label="المعرّف (slug)" dir="ltr" value={data.slug} onChange={(v) => setData("slug", v)} error={e.slug} hint="q3-2026 — يظهر في الرابط" />
            <Select label="الحالة" value={data.status} onChange={(v) => setData("status", v)} options={{ draft: "مسودّة", published: "منشور" }} error={e.status} />
            <TextField className="md:col-span-3" label="الفترة" value={data.range} onChange={(v) => setData("range", v)} error={e.range} />
            <TextField className="md:col-span-3" label="عنوان التقرير" value={data.report_title} onChange={(v) => setData("report_title", v)} error={e.report_title} />
            <Toggle label="التقرير الحالي" checked={data.is_current} onChange={(v) => setData("is_current", v)} hint="واحد فقط؛ تفعيله هنا يلغي غيره. يجب أن يكون منشوراً." />
            <FileField label="ملف التقرير (PDF)" accept="application/pdf" isImage={false} current={r?.report_file ?? null} file={data.report_file} remove={data.remove_report_file} onFile={(f) => setData("report_file", f)} onRemove={(v) => setData("remove_report_file", v)} error={e.report_file} />
          </div>
          {e.is_current && <ErrorText className="mt-3">{e.is_current}</ErrorText>}
        </Card>

        <Card title="المؤشّرات">
          <TextField className="mb-4" label="عنوان المؤشّرات" value={data.metrics_title} onChange={(v) => setData("metrics_title", v)} error={e.metrics_title} />
          <Repeater<FigureRow> items={data.metrics} onChange={(m) => setData("metrics", m)} make={newFigure} addLabel="مؤشّر"
            render={(m, update, i) => <FigureFields row={m} update={update} errors={e} prefix={`metrics.${i}`} />} />
        </Card>

        {lineGroups.map((g) => (
          <Card key={g.value} title={g.label}>
            {TITLED[g.value] && (
              <TextField className="mb-4" label={TITLED[g.value].label} value={titles[TITLED[g.value].title]} onChange={(v) => setTitle(TITLED[g.value].title, v)} hint="فارغ = لا يظهر القسم." />
            )}
            {g.value === "closing_paragraph" && (
              <TextField className="mb-4" label="توقيع الخاتمة" value={data.closing_signoff} onChange={(v) => setData("closing_signoff", v)} />
            )}
            {g.value === "appeal_item" && (
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <TextField label="عنوان نداء الدعم" value={data.appeal_title} onChange={(v) => setData("appeal_title", v)} hint="فارغ = لا نداء." />
                <TextField label="تعليق الصورة" value={data.appeal_photo_caption} onChange={(v) => setData("appeal_photo_caption", v)} />
                <TextArea className="md:col-span-2" label="افتتاحية النداء" value={data.appeal_lead} onChange={(v) => setData("appeal_lead", v)} />
                <FileField label="صورة النداء" current={r?.appeal_photo ?? null} file={data.appeal_photo} remove={data.remove_appeal_photo} onFile={(f) => setData("appeal_photo", f)} onRemove={(v) => setData("remove_appeal_photo", v)} error={e.appeal_photo} />
              </div>
            )}
            <Repeater<LineRow> compact items={data.lines[g.value] ?? []} make={() => ({ term: "", body: "" })} addLabel="سطر"
              onChange={(rows) => setData("lines", { ...data.lines, [g.value]: rows })}
              render={(l, update, i) => (
                <div className="space-y-2">
                  {g.hasTerm && <TextField label="المصطلح" value={l.term} onChange={(v) => update({ term: v })} />}
                  <TextArea label="النصّ" value={l.body} onChange={(v) => update({ body: v })} error={e[`lines.${g.value}.${i}.body`]} rows={2} />
                </div>
              )} />
          </Card>
        ))}

        <Card title="جدول الملخّص">
          <TableEditor value={data.summary} onChange={(t) => setData("summary", t)} />
        </Card>

        <Card title="الترجمات">
          <TranslationFields value={data.translations} onChange={(t) => setData("translations", t)} errors={e} fields={[
            { key: "label", label: "Label" }, { key: "range", label: "Range" },
            { key: "report_title", label: "Report title" }, { key: "metrics_title", label: "Metrics title" },
          ]} />
          <p className="mt-3 text-xs text-ink/60">ترجمات المؤشّرات والمقدّمة وافتتاحيات الأقسام تُحرَّر من «طابور الترجمات». السرد الطويل لا يُعرض مترجماً — كما في القواعد.</p>
        </Card>

        <SubmitBar processing={form.processing} label={r ? "حفظ التقرير" : "إنشاء التقرير"} />
      </form>

      {r && (
        <Card flush title="أقسام المجالات" className="mt-8">
          {r.sections.length > 0 && (
            <ul className="divide-y divide-rule border-b border-rule">
              {r.sections.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <IndexChip>{i + 1}</IndexChip>
                    <Link href={`/admin/sections/${s.id}/edit`} className="truncate font-bold transition hover:text-olive">{s.pillar}</Link>
                  </span>
                  <div className="flex gap-2">
                    <LinkButton href={`/admin/sections/${s.id}/edit`} size="sm">تحرير</LinkButton>
                    <DeleteButton small url={`/admin/sections/${s.id}`} confirm="حذف القسم بمجموعاته وأرقامه؟" />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="p-5">
            <div className="flex flex-wrap items-end gap-2">
              <Select className="min-w-56" label="إضافة قسم لمجال" value={pillar} onChange={setPillar} options={Object.fromEntries(pillars.map((p) => [String(p.id), p.short]))} />
              <Button onClick={() => router.post(`/admin/reports/${r.id}/sections`, { pillar_id: Number(pillar) })}>+ إضافة</Button>
            </div>
            {e.pillar_id && <ErrorText className="mt-2">{e.pillar_id}</ErrorText>}
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}
