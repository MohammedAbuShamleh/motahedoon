import { Head, router, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FigureFields, newFigure } from "../../components/FigureFields";
import { Repeater } from "../../components/Repeater";
import { TranslationFields } from "../../components/TranslationFields";
import { Card, ErrorSummary, LinkButton, PageHeader, Select, SubmitBar, TextArea, TextField } from "../../components/ui";
import { emptyTranslations, str } from "../../lib/form";
import type { FigureRow, Translations } from "../../types";

type Line = { id?: number; term: string; body: string; translations: Translations };
type Metric = FigureRow & { translations: Translations };
type SourceLine = { id: number; term: string | null; body: string; translations: Translations };
type ReportOption = { id: number; label: string; is_current: boolean; status: string };
type ImpactReport = {
  id: number; label: string; range: string; slug: string; status: string; is_current: boolean;
  metrics_title: string; reading_title: string | null;
  translations: Translations;
  metrics: (Metric & { id: number })[];
  highlight: SourceLine[];
  reading: SourceLine[];
};
type Props = { reports: ReportOption[]; report: ImpactReport | null; homeCount: number };

const toLines = (rows: SourceLine[]): Line[] =>
  rows.map((l) => ({ id: l.id, term: str(l.term), body: l.body, translations: l.translations }));

/** أخطاء بند واحد بلا بادئته، لتقرأها TranslationFields بمفاتيحها القصيرة. */
const scoped = (errors: Record<string, string | undefined>, prefix: string) =>
  Object.fromEntries(Object.entries(errors)
    .filter(([k]) => k.startsWith(`${prefix}.`))
    .map(([k, v]) => [k.slice(prefix.length + 1), v]));

/** ترجمة بند داخل قائمة: مطويّة افتراضياً كي لا تطول الصفحة، وتُفتح حيث فيها خطأ. */
function ItemTranslation({ fields, value, onChange, errors }: {
  fields: { key: string; label: string; multiline?: boolean }[];
  value: Translations;
  onChange: (t: Translations) => void;
  errors: Record<string, string | undefined>;
}) {
  const done = (["en", "tr"] as const).filter((l) => fields.every((f) => (value[l]?.[f.key] ?? "").trim() !== "")).length;
  return (
    <details className="mt-3 rounded-lg border border-rule" open={Object.keys(errors).length > 0}>
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-bold text-ink/70">
        الترجمة الإنجليزية والتركية · {done} من 2
      </summary>
      <div className="border-t border-rule p-3">
        <TranslationFields fields={fields} value={value} onChange={onChange} errors={errors} />
      </div>
    </details>
  );
}

const METRIC_FIELDS = [{ key: "label", label: "وصف الرقم" }, { key: "unit", label: "الوحدة" }];
const newMetric = (): Metric => ({ ...newFigure(), translations: emptyTranslations(["label", "unit"]) });
const newHighlight = (): Line => ({ term: "", body: "", translations: emptyTranslations(["body"]) });
const newReading = (): Line => ({ term: "", body: "", translations: emptyTranslations(["term", "body"]) });

/**
 * الإنجازات والأثر: ما يراه الزائر من أرقام التقرير وإنجازاته في مكان واحد —
 * «لمحة أثر» في الرئيسية، وشريحة الأرقام و«أبرز الإنجازات» و«قراءة الأثر»
 * في صفحة التقرير. باقي حقول التقرير في «التقارير الربعية».
 */
export default function Index({ reports, report, homeCount }: Props) {
  return (
    <AdminLayout>
      <Head title="الإنجازات والأثر" />
      <PageHeader title="الإنجازات والأثر" subtitle="الأرقام تُكتب كما في المصدر حرفياً: لا جمع، لا تقريب، لا اختصار."
        actions={report ? <LinkButton href={`/admin/reports/${report.id}/edit`}>كلّ حقول التقرير</LinkButton> : undefined} />
      {report
        ? <ImpactForm key={report.id} reports={reports} report={report} homeCount={homeCount} />
        : (
          <Card>
            <p className="text-sm text-ink/70">لا تقارير بعد. أنشئ تقريراً من «التقارير الربعية» أولاً، ثم عُد إلى هنا لتحرير أرقامه وإنجازاته.</p>
            <div className="mt-4"><LinkButton href="/admin/reports/create">تقرير جديد</LinkButton></div>
          </Card>
        )}
    </AdminLayout>
  );
}

function ImpactForm({ reports, report: r, homeCount }: { reports: ReportOption[]; report: ImpactReport; homeCount: number }) {
  const form = useForm({
    home_metrics_count: String(homeCount),
    metrics_title: r.metrics_title,
    reading_title: str(r.reading_title),
    translations: r.translations,
    metrics: r.metrics.map((m) => ({ ...m, prefix: str(m.prefix), unit: str(m.unit) })) as Metric[],
    highlight: toLines(r.highlight),
    reading: toLines(r.reading),
  });
  const { data, setData } = form;
  const e = form.errors as Record<string, string | undefined>;

  const options = Object.fromEntries(reports.map((o) => [
    String(o.id),
    `${o.label}${o.is_current ? " — الحالي" : ""}${o.status === "draft" ? " (مسودّة)" : ""}`,
  ]));
  const pick = (id: string) => {
    if (form.isDirty && !window.confirm("لم تُحفظ التعديلات. الانتقال إلى تقرير آخر يتجاهلها، هل تتابع؟")) return;
    router.get("/admin/impact", { report: id }, { preserveScroll: true });
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    form.put(`/admin/impact/${r.id}`, { preserveScroll: true });
  };

  const shown = Math.min(Number(data.home_metrics_count) || 0, data.metrics.length);

  return (
    <>
      <ErrorSummary errors={e} />
      <form onSubmit={submit} className="space-y-6">
        <Card title="التقرير">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="أيّ تقرير تحرّر" value={String(r.id)} onChange={pick} options={options} />
            <div className="text-sm leading-6 text-ink/70 md:pt-7">
              {r.range}
              {!r.is_current && (
                <p className="mt-1 text-xs text-red">
                  ليس التقرير الحالي: أرقامه لا تظهر في «لمحة أثر» بالرئيسية، بل في صفحته فقط.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card title="الأرقام والمؤشّرات">
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <TextField className="md:col-span-2" label="عنوان المؤشّرات" value={data.metrics_title}
              onChange={(v) => setData("metrics_title", v)} error={e.metrics_title}
              hint="عنوان شريحة الأرقام في صفحة التقرير." />
            <TextField label="عدد الأرقام في «لمحة أثر» بالرئيسية" type="number" dir="ltr" value={data.home_metrics_count}
              onChange={(v) => setData("home_metrics_count", v)} error={e.home_metrics_count}
              hint={`تظهر أوّل ${shown} من ${data.metrics.length} بالترتيب أدناه. صفر يُخفي القسم.`} />
          </div>
          <p className="mb-4 text-xs leading-6 text-ink/60">
            «إبراز الرقم» يجعله يتصدّر الشريحة بحجم أكبر. رتّب الأرقام بالأسهم: الأوّل يظهر أوّلاً في الرئيسية وفي التقرير.
          </p>
          <Repeater<Metric> items={data.metrics} onChange={(m) => setData("metrics", m)} make={newMetric} addLabel="رقم"
            empty="لا أرقام بعد."
            render={(m, update, i) => (
              <>
                <FigureFields row={m} update={update} errors={e} prefix={`metrics.${i}`} />
                <ItemTranslation fields={METRIC_FIELDS} value={m.translations}
                  onChange={(t) => update({ translations: t })} errors={scoped(e, `metrics.${i}`)} />
              </>
            )} />
        </Card>

        <Card title="أبرز الإنجازات">
          <p className="mb-4 text-xs leading-6 text-ink/60">بطاقات تحت الأرقام في صفحة التقرير. بند لكلّ إنجاز، وتُرقَّم تلقائياً.</p>
          <Repeater<Line> compact items={data.highlight} onChange={(rows) => setData("highlight", rows)}
            make={newHighlight} addLabel="إنجاز" empty="لا إنجازات بعد."
            render={(l, update, i) => (
              <>
                <TextArea label="نصّ الإنجاز" value={l.body} onChange={(v) => update({ body: v })} error={e[`highlight.${i}.body`]} rows={2} />
                <ItemTranslation fields={[{ key: "body", label: "نصّ الإنجاز", multiline: true }]} value={l.translations}
                  onChange={(t) => update({ translations: t })} errors={scoped(e, `highlight.${i}`)} />
              </>
            )} />
        </Card>

        <Card title="قراءة الأثر">
          <TextField className="mb-4" label="عنوان القسم" value={data.reading_title}
            onChange={(v) => setData("reading_title", v)} error={e.reading_title}
            hint="اتركه فارغاً لإخفاء «قراءة الأثر» من صفحة التقرير." />
          <Repeater<Line> compact items={data.reading} onChange={(rows) => setData("reading", rows)}
            make={newReading} addLabel="قراءة" empty="لا قراءات بعد."
            render={(l, update, i) => (
              <div className="space-y-2">
                <TextField label="العنوان" value={l.term} onChange={(v) => update({ term: v })} error={e[`reading.${i}.term`]} />
                <TextArea label="النصّ" value={l.body} onChange={(v) => update({ body: v })} error={e[`reading.${i}.body`]} rows={2} />
                <ItemTranslation fields={[{ key: "term", label: "العنوان" }, { key: "body", label: "النصّ", multiline: true }]}
                  value={l.translations} onChange={(t) => update({ translations: t })} errors={scoped(e, `reading.${i}`)} />
              </div>
            )} />
        </Card>

        <Card title="ترجمة العناوين">
          <p className="mb-4 text-xs leading-6 text-ink/60">
            ترجمة كلّ رقم وإنجاز وقراءة تحت بنده أعلاه. أيّ تعديل يُحفظ «بانتظار المراجعة» حتى يعتمده المدير من «مراجعة الترجمات».
            في الإنجليزية والتركية تظهر «أبرز الإنجازات» و«قراءة الأثر» حين يُترجَم كلّ بنودها — وإلا تُحذف ولا تُخلط بالعربية.
          </p>
          <TranslationFields value={data.translations} onChange={(t) => setData("translations", t)} errors={e} fields={[
            { key: "metrics_title", label: "عنوان المؤشّرات" },
            { key: "reading_title", label: "عنوان «قراءة الأثر»" },
          ]} />
        </Card>

        <SubmitBar processing={form.processing} label="حفظ الإنجازات والأثر" />
      </form>
    </>
  );
}
