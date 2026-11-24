import { Head, Link, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { TranslationFields } from "../../components/TranslationFields";
import { Card, ErrorSummary, FileField, LinkButton, PageHeader, SubmitBar, TextField, Toggle } from "../../components/ui";
import { emptyTranslations, send, str } from "../../lib/form";
import type { MediaBrief, Translations } from "../../types";

type Pillar = {
  id: number; slug: string; num: string; title: string; short: string; orgs: string;   cover_caption: string | null; position: number; is_published: boolean; cover: MediaBrief; translations: Translations;
};

const FIELDS = ["title", "short", "cover_caption", "orgs"];

export default function Form({ pillar: p, nextNum }: { pillar: Pillar | null; nextNum?: string }) {
  const form = useForm({
    slug: p?.slug ?? "", num: p?.num ?? nextNum ?? "", title: p?.title ?? "", short: p?.short ?? "", orgs: p?.orgs ?? "",
    cover_caption: str(p?.cover_caption),
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
        <Card title="بيانات المجال">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField label="الرقم" dir="ltr" value={data.num} onChange={(v) => setData("num", v)} error={e.num} hint={p ? "مثل 01" : "يُملأ تلقائياً بالرقم التالي، ويمكن تركه فارغاً"} />
            <TextField label="المعرّف في الرابط" dir="ltr" value={data.slug} onChange={(v) => setData("slug", v)} error={e.slug} hint="يظهر في رابط صفحة المجال، مثل /p/dawah" />
            <TextField label="الترتيب" type="number" dir="ltr" value={data.position} onChange={(v) => setData("position", v)} error={e.position} hint="اتركه فارغاً ليكون في آخر القائمة" />
            <TextField className="md:col-span-3" label="العنوان الكامل" value={data.title} onChange={(v) => setData("title", v)} error={e.title} />
            <TextField label="العنوان المختصر" value={data.short} onChange={(v) => setData("short", v)} error={e.short} />
            <TextField className="md:col-span-2" label="الجهات المنفّذة" value={data.orgs} onChange={(v) => setData("orgs", v)} error={e.orgs} hint="افصل بين الجهات بالرمز |" />
            {p && (
              <p className="md:col-span-3 rounded-lg border border-dashed border-rule p-3 text-sm text-ink/70">
                التعريف الدائم وحصيلة المجال في الفترات تُحرَّر في{" "}
                <Link href={`/admin/pillars/${p.id}/details`} className="font-bold text-green underline">صفحة تفاصيل المجال</Link>.
              </p>
            )}
          </div>
        </Card>
        <Card title="صورة الغلاف">
          <div className="grid gap-4 md:grid-cols-2">
            <FileField label="الصورة" current={p?.cover ?? null} file={data.cover} remove={data.remove_cover} onFile={(f) => setData("cover", f)} onRemove={(v) => setData("remove_cover", v)} error={e.cover} hint="تتحوّل تلقائياً إلى الأبيض والأسود. بلا اسم مكان ولا وجوه أطفال قريبة." />
            <TextField label="وصف الصورة" value={data.cover_caption} onChange={(v) => setData("cover_caption", v)} hint="بلا اسم مكان أو حيّ." />
          </div>
          <div className="mt-4"><Toggle label="ظاهر في الموقع" checked={data.is_published} onChange={(v) => setData("is_published", v)} /></div>
        </Card>
        <Card title="الترجمة الإنجليزية والتركية">
          <TranslationFields value={data.translations} onChange={(t) => setData("translations", t)} errors={e} fields={[
            { key: "title", label: "العنوان الكامل" }, { key: "short", label: "العنوان المختصر" }, { key: "orgs", label: "الجهات المنفّذة" },
            { key: "cover_caption", label: "وصف الصورة" },
          ]} />
        </Card>
        <SubmitBar processing={form.processing} />
      </form>
    </AdminLayout>
  );
}
