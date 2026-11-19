import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { TranslationFields } from "../../components/TranslationFields";
import { Card, ErrorSummary, FileField, LinkButton, PageHeader, SubmitBar, TextArea, TextField, Toggle } from "../../components/ui";
import { emptyTranslations, send, str } from "../../lib/form";
import type { MediaBrief, Translations } from "../../types";

type Partner = {
  id: number; slug: string; name: string; site_url: string | null; role: string | null; about: string | null;
  position: number; is_published: boolean; logo: MediaBrief; translations: Translations;
};

const PENDING = "اتركه فارغاً إن لم يُعتمد بعد؛ سيظهر في الموقع «بانتظار اعتماد التجمع».";

export default function Form({ partner: p }: { partner: Partner | null }) {
  const form = useForm({
    slug: p?.slug ?? "", name: p?.name ?? "", site_url: str(p?.site_url), role: str(p?.role), about: str(p?.about),
    position: p ? String(p.position) : "", is_published: p?.is_published ?? true,
    logo: null as File | null, remove_logo: false,
    translations: p?.translations ?? emptyTranslations(["name"]),
  });
  const { data, setData } = form;
  const e = form.errors as Record<string, string | undefined>;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    send(form, p ? "put" : "post", p ? `/admin/partners/${p.id}` : "/admin/partners");
  };

  return (
    <AdminLayout>
      <Head title={p ? p.name : "مؤسسة جديدة"} />
      <PageHeader title={p ? p.name : "مؤسسة جديدة"} actions={<LinkButton href="/admin/partners">رجوع</LinkButton>} />
      <ErrorSummary errors={e} />
      <form onSubmit={submit} className="space-y-6">
        <Card title="بيانات المؤسسة">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="الاسم" value={data.name} onChange={(v) => setData("name", v)} error={e.name} />
            <TextField label="المعرّف في الرابط" dir="ltr" value={data.slug} onChange={(v) => setData("slug", v)} error={e.slug} hint="حروف إنجليزية صغيرة وشرطات، مثل ibn-baz" />
            <TextField label="الموقع الإلكتروني" dir="ltr" value={data.site_url} onChange={(v) => setData("site_url", v)} error={e.site_url} hint={PENDING} />
            <TextField label="الترتيب" type="number" dir="ltr" value={data.position} onChange={(v) => setData("position", v)} hint="اتركه فارغاً لتكون في آخر القائمة" />
            <TextField className="md:col-span-2" label="الدور في التجمّع" value={data.role} onChange={(v) => setData("role", v)} hint={PENDING} />
            <TextArea className="md:col-span-2" label="نبذة" value={data.about} onChange={(v) => setData("about", v)} hint={PENDING} />
            <FileField label="الشعار" current={p?.logo ?? null} file={data.logo} remove={data.remove_logo} onFile={(f) => setData("logo", f)} onRemove={(v) => setData("remove_logo", v)} error={e.logo} hint="يُحفظ الشعار بألوانه كما هو." />
            <div className="flex items-center"><Toggle label="ظاهرة في الموقع" checked={data.is_published} onChange={(v) => setData("is_published", v)} /></div>
          </div>
        </Card>
        <Card title="الترجمة الإنجليزية والتركية">
          <TranslationFields fields={[{ key: "name", label: "الاسم" }]} value={data.translations} onChange={(t) => setData("translations", t)} errors={e} />
        </Card>
        <SubmitBar processing={form.processing} />
      </form>
    </AdminLayout>
  );
}
