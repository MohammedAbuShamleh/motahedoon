import { Head, useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { RichEditor } from "../../components/RichEditor";
import { SectionEditor, type Section } from "../../components/SectionEditor";
import { TranslationFields } from "../../components/TranslationFields";
import { Button, Card, Empty, ErrorSummary, Field, LinkButton, PageHeader, SubmitBar, inputClass } from "../../components/ui";
import { send, str } from "../../lib/form";
import type { Translations } from "../../types";

type Pillar = { id: number; num: string; short: string; title: string; slug: string; definition: string | null; translations: Translations };

/**
 * صفحة المجال في اللوحة: كل ما تعرضه صفحته في الموقع في مكان واحد —
 * التعريف الدائم (المتن)، ثم حصيلته في كل فترة (الحاشية)، الأحدث أولاً.
 * الحصيلة أقسام التقارير نفسها: ما يُحفظ هنا يظهر في محرّر التقرير والعكس.
 */
export default function Details({ pillar: p, sections, reports }: {
  pillar: Pillar;
  sections: Section[];
  reports: { id: number; label: string }[];
}) {
  // الأحدث مفتوح؛ البقية تُفتح عند الطلب فلا تُنشأ محرّراتها كلها دفعة واحدة
  const [open, setOpen] = useState<number | null>(sections[0]?.id ?? null);

  return (
    <AdminLayout>
      <Head title={`تفاصيل ${p.short}`} />
      <PageHeader
        title={`${p.num} · ${p.short}`}
        subtitle={p.title}
        actions={
          <>
            <LinkButton href="/admin/pillars/guide">الدليل</LinkButton>
            <LinkButton href={`/p/${p.slug}`}>عرض في الموقع</LinkButton>
            <LinkButton href={`/admin/pillars/${p.id}/edit`}>البيانات الأساسية</LinkButton>
            <LinkButton href="/admin/pillars">رجوع</LinkButton>
          </>
        }
      />

      <div className="space-y-8">
        <DefinitionForm pillar={p} />

        <section className="space-y-4">
          <h2 className="text-lg font-black">الحصيلة في الفترات</h2>
          {sections.length === 0 && <Empty>لم يَرِد هذا المجال في أي تقرير بعد.</Empty>}
          {sections.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-xl border border-rule bg-paper">
              <button
                type="button"
                aria-expanded={open === s.id}
                onClick={() => setOpen(open === s.id ? null : s.id)}
                className="flex w-full items-center justify-between gap-3 border-s-[3px] border-olive px-5 py-4 text-start font-bold transition hover:bg-rule/20"
              >
                <span>{s.report.label}</span>
                <span className="text-sm text-ink/60">{open === s.id ? "طيّ ▲" : "تحرير ▼"}</span>
              </button>
              {open === s.id && (
                <div className="border-t border-rule p-5">
                  <p className="mb-4 text-xs text-ink/60">
                    هذا القسم جزء من «{s.report.label}». يُحذف من{" "}
                    <a className="font-bold text-green underline" href={`/admin/reports/${s.report.id}/edit`}>صفحة التقرير</a>.
                  </p>
                  <SectionEditor section={s} />
                </div>
              )}
            </div>
          ))}
          <AddToReport pillarId={p.id} reports={reports} />
        </section>
      </div>
    </AdminLayout>
  );
}

function DefinitionForm({ pillar: p }: { pillar: Pillar }) {
  const form = useForm({ definition: str(p.definition), translations: p.translations });
  const { data, setData } = form;
  const e = form.errors as Record<string, string | undefined>;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    send(form, "put", `/admin/pillars/${p.id}/details`);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <ErrorSummary errors={e} />
      <Card title="التعريف الدائم بالمجال">
        <RichEditor
          label="التعريف"
          value={data.definition}
          onChange={(v) => setData("definition", v)}
          error={e.definition}
          hint="اتركه فارغاً إن لم يُعتمد بعد؛ سيظهر في الموقع «بانتظار اعتماد التجمع». لا تكتب نصّاً من عندك."
        />
      </Card>
      <Card title="ترجمة التعريف">
        <TranslationFields fields={[{ key: "definition", label: "التعريف", rich: true }]} value={data.translations} onChange={(t) => setData("translations", t)} errors={e} />
      </Card>
      <SubmitBar processing={form.processing} label="حفظ التعريف" />
    </form>
  );
}

function AddToReport({ pillarId, reports }: { pillarId: number; reports: { id: number; label: string }[] }) {
  const form = useForm({ report_id: "" });

  if (reports.length === 0) {
    return <p className="text-sm text-ink/60">هذا المجال موجود في كل التقارير.</p>;
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-rule p-4">
      {/* قائمة أصلية لا Select: مفاتيح الكائن الرقمية تُرتَّب تصاعدياً فيضيع ترتيب «الأحدث أولاً» */}
      <Field label="إضافة المجال إلى تقرير" error={form.errors.report_id}>
        <select value={form.data.report_id} onChange={(ev) => form.setData("report_id", ev.target.value)} className={inputClass}>
          <option value="">اختر تقريراً…</option>
          {reports.map((r) => <option key={r.id} value={String(r.id)}>{r.label}</option>)}
        </select>
      </Field>
      <Button
        type="button"
        disabled={!form.data.report_id || form.processing}
        onClick={() => form.post(`/admin/pillars/${pillarId}/sections`, { preserveScroll: true, onSuccess: () => form.reset() })}
      >
        + إضافة
      </Button>
    </div>
  );
}
