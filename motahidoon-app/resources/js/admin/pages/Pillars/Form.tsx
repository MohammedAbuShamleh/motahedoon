import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { TranslationFields } from "../../components/TranslationFields";
import { Card, ErrorSummary, FileField, LinkButton, PageHeader, SubmitBar, TextArea, TextField, Toggle } from "../../components/ui";
import { emptyTranslations, send, str } from "../../lib/form";
import type { MediaBrief, Translations } from "../../types";

type Pillar = {
  id: number; slug: string; num: string; title: string; short: string; orgs: string; definition: string | null;
  cover_caption: string | null; position: number; is_published: boolean; cover: MediaBrief; translations: Translations;
};

const FIELDS = ["title", "short", "cover_caption", "orgs", "definition"];

export default function Form({ pillar: p, nextNum }: { pillar: Pillar | null; nextNum?: string }) {
  const form = useForm({
    slug: p?.slug ?? "", num: p?.num ?? nextNum ?? "", title: p?.title ?? "", short: p?.short ?? "", orgs: p?.orgs ?? "",
    definition: str(p?.definition), cover_caption: str(p?.cover_caption),
    position: p ? String(p.position) : "", is_published: p?.is_published ?? true,
    cover: null as File | null, remove_cover: false,
    translations: p?.translations ?? emptyTranslations(FIELDS),
  });
  const { data, setData } = form;
  const e = form.errors as Record<string, string | undefined>;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    send(form, p ? "put" : "post", p ? `/admin/pillars/${p.id}` : "/admin/pillars");
  };

  return (
    <AdminLayout>
      <Head title={p ? p.short : "مجال جديد"} />
      <PageHeader title={p ? p.short : "مجال جديد"} actions={<LinkButton href="/admin/pillars">رجوع</LinkButton>} />
      <ErrorSummary errors={e} />
      <form onSubmit={submit} className="space-y-6">
        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField label="الرقم" dir="ltr" value={data.num} onChange={(v) => setData("num", v)} error={e.num} hint={p ? "مثل 01" : "يُملأ تلقائياً بالرقم التالي · فارغ = التالي"} />
            <TextField label="المعرّف (slug)" dir="ltr" value={data.slug} onChange={(v) => setData("slug", v)} error={e.slug} hint="يظهر في الرابط: /p/dawah" />
            <TextField label="الترتيب" type="number" dir="ltr" value={data.position} onChange={(v) => setData("position", v)} error={e.position} hint="فارغ = آخر القائمة" />
            <TextField className="md:col-span-3" label="العنوان الكامل" value={data.title} onChange={(v) => setData("title", v)} error={e.title} />
            <TextField label="العنوان المختصر" value={data.short} onChange={(v) => setData("short", v)} error={e.short} />
            <TextField className="md:col-span-2" label="الجهات المنفّذة" value={data.orgs} onChange={(v) => setData("orgs", v)} error={e.orgs} hint="تُفصل بـ |" />
            <TextArea className="md:col-span-3" rows={5} label="التعريف" value={data.definition} onChange={(v) => setData("definition", v)} hint="فارغ = خانة محجوزة «بانتظار اعتماد التجمع». لا تكتب نصّاً من عندك." />
          </div>
        </Card>
        <Card title="الغلاف">
          <div className="grid gap-4 md:grid-cols-2">
            <FileField label="صورة الغلاف" current={p?.cover ?? null} file={data.cover} remove={data.remove_cover} onFile={(f) => setData("cover", f)} onRemove={(v) => setData("remove_cover", v)} error={e.cover} hint="تُحوَّل أبيض وأسود في الملف نفسه. لا اسم مكان ولا وجوه قريبة لأطفال." />
            <TextField label="تعليق الغلاف" value={data.cover_caption} onChange={(v) => setData("cover_caption", v)} hint="بلا اسم مكان أو حيّ." />
          </div>
          <div className="mt-4"><Toggle label="منشور في الموقع" checked={data.is_published} onChange={(v) => setData("is_published", v)} /></div>
        </Card>
        <Card title="الترجمات">
          <TranslationFields value={data.translations} onChange={(t) => setData("translations", t)} errors={e} fields={[
            { key: "title", label: "Title" }, { key: "short", label: "Short title" }, { key: "orgs", label: "Organisations" },
            { key: "cover_caption", label: "Cover caption" }, { key: "definition", label: "Definition", multiline: true },
          ]} />
        </Card>
        <SubmitBar processing={form.processing} />
      </form>
    </AdminLayout>
  );
}
