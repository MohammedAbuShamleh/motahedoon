import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { TranslationFields } from "../../components/TranslationFields";
import { Card, ErrorSummary, FileField, PageHeader, SubmitBar, TextArea, TextField } from "../../components/ui";
import { send, str } from "../../lib/form";
import type { MediaBrief, Translations } from "../../types";

type Settings = {
  name: string; short_name: string; tagline: string; vision: string; mission: string;
  founding_year: string | null; media_office: string; governance: string | null;
  contact_email: string | null; contact_phone: string | null; contact_address: string | null;
  donate_url: string | null; donate_label: string; home_metrics_count: number;
  logo_full: MediaBrief; logo_mark: MediaBrief; donate_qr: MediaBrief;
  translations: Translations;
};

const PENDING = "اتركه فارغاً إن لم يُعتمد بعد؛ سيظهر في الموقع «بانتظار اعتماد التجمع». لا تضع نصّاً مؤقّتاً.";

export default function Edit({ settings: s }: { settings: Settings }) {
  const form = useForm({
    name: s.name, short_name: s.short_name, tagline: s.tagline, vision: s.vision, mission: s.mission,
    founding_year: str(s.founding_year), media_office: s.media_office, governance: str(s.governance),
    contact_email: str(s.contact_email), contact_phone: str(s.contact_phone), contact_address: str(s.contact_address),
    donate_url: str(s.donate_url), donate_label: s.donate_label, home_metrics_count: String(s.home_metrics_count),
    logo_full: null as File | null, remove_logo_full: false,
    logo_mark: null as File | null, remove_logo_mark: false,
    donate_qr: null as File | null, remove_donate_qr: false,
    translations: s.translations,
  });
  const { data, setData, errors } = form;
  const e = errors as Record<string, string | undefined>;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    send(form, "put", "/admin/settings", () => form.setData((d) => ({ ...d, logo_full: null, logo_mark: null, donate_qr: null })));
  };

  return (
    <AdminLayout>
      <Head title="بيانات التجمّع" />
      <PageHeader title="بيانات التجمّع" subtitle="المعلومات الأساسية التي لا تتغيّر بتغيّر الفترات. النصّ العربي هو الأصل، والترجمات تتبعه." />
      <ErrorSummary errors={e} />
      <form onSubmit={submit} className="space-y-6">
        <Card title="الاسم والشعار">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="الاسم الكامل" value={data.name} onChange={(v) => setData("name", v)} error={e.name} />
            <TextField label="الاسم المختصر" value={data.short_name} onChange={(v) => setData("short_name", v)} error={e.short_name} />
            <TextField className="md:col-span-2" label="العبارة التعريفية" value={data.tagline} onChange={(v) => setData("tagline", v)} error={e.tagline} hint="تظهر كبيرةً أعلى الصفحة الرئيسية، وكلمتها الأخيرة بالأحمر." />
            <FileField label="الشعار الكامل" current={s.logo_full} file={data.logo_full} remove={data.remove_logo_full} onFile={(f) => setData("logo_full", f)} onRemove={(v) => setData("remove_logo_full", v)} error={e.logo_full} />
            <FileField label="الشعار المصغّر (الأيقونة)" current={s.logo_mark} file={data.logo_mark} remove={data.remove_logo_mark} onFile={(f) => setData("logo_mark", f)} onRemove={(v) => setData("remove_logo_mark", v)} error={e.logo_mark} />
          </div>
        </Card>

        <Card title="الرؤية والرسالة والتأسيس">
          <div className="grid gap-4">
            <TextArea label="الرؤية" value={data.vision} onChange={(v) => setData("vision", v)} error={e.vision} />
            <TextArea label="الرسالة" value={data.mission} onChange={(v) => setData("mission", v)} error={e.mission} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="سنة التأسيس" dir="ltr" value={data.founding_year} onChange={(v) => setData("founding_year", v)} error={e.founding_year} />
              <TextField label="اسم المكتب الإعلامي" value={data.media_office} onChange={(v) => setData("media_office", v)} error={e.media_office} />
            </div>
            <TextArea label="الحوكمة" value={data.governance} onChange={(v) => setData("governance", v)} hint={PENDING} />
          </div>
        </Card>

        <Card title="التواصل والدعم">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField label="البريد الإلكتروني" dir="ltr" value={data.contact_email} onChange={(v) => setData("contact_email", v)} error={e.contact_email} hint={PENDING} />
            <TextField label="الهاتف" dir="ltr" value={data.contact_phone} onChange={(v) => setData("contact_phone", v)} hint={PENDING} />
            <TextField label="العنوان" value={data.contact_address} onChange={(v) => setData("contact_address", v)} hint={PENDING} />
            <TextField label="رابط التبرّع" dir="ltr" value={data.donate_url} onChange={(v) => setData("donate_url", v)} error={e.donate_url} />
            <TextField label="نصّ زرّ الدعم" value={data.donate_label} onChange={(v) => setData("donate_label", v)} error={e.donate_label} />
            <TextField label="عدد الأرقام في «لمحة أثر»" type="number" dir="ltr" value={data.home_metrics_count} onChange={(v) => setData("home_metrics_count", v)} error={e.home_metrics_count} />
            <FileField label="رمز QR للتبرّع" current={s.donate_qr} file={data.donate_qr} remove={data.remove_donate_qr} onFile={(f) => setData("donate_qr", f)} onRemove={(v) => setData("remove_donate_qr", v)} error={e.donate_qr} />
          </div>
        </Card>

        <Card title="الترجمات">
          <TranslationFields
            value={data.translations}
            onChange={(t) => setData("translations", t)}
            errors={e}
            fields={[
              { key: "name", label: "الاسم الكامل" },
              { key: "short_name", label: "الاسم المختصر" },
              { key: "tagline", label: "العبارة التعريفية" },
              { key: "media_office", label: "اسم المكتب الإعلامي" },
              { key: "vision", label: "الرؤية", multiline: true },
              { key: "mission", label: "الرسالة", multiline: true },
              { key: "unapproved_notice", label: "تنويه «ترجمة غير معتمدة»", multiline: true },
            ]}
          />
        </Card>

        <SubmitBar processing={form.processing} />
      </form>
    </AdminLayout>
  );
}
