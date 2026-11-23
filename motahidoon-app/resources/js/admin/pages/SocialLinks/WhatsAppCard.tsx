import { useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { Button, Card, TextArea, TextField, Toggle } from "../../components/ui";

export type WhatsAppSettings = { enabled: boolean; number: string; text: { ar: string; en: string; tr: string } };

const LANGS: { key: "ar" | "en" | "tr"; label: string; dir: "rtl" | "ltr" }[] = [
  { key: "ar", label: "النصّ الجاهز بالعربية", dir: "rtl" },
  { key: "en", label: "النصّ الجاهز بالإنجليزية", dir: "ltr" },
  { key: "tr", label: "النصّ الجاهز بالتركية", dir: "ltr" },
];

/** زرّ واتساب العائم: إظهاره، والرقم، والنصّ الذي يُكتب سلفاً في المحادثة بلغة الصفحة */
export function WhatsAppCard({ settings, orgName }: { settings: WhatsAppSettings; orgName: string }) {
  const form = useForm({
    whatsapp_enabled: settings.enabled,
    whatsapp_number: settings.number ? `+${settings.number}` : "",
    whatsapp_text: { ...settings.text },
  });
  const e = form.errors as Record<string, string | undefined>;
  const digits = form.data.whatsapp_number.replace(/\D+/g, "");
  const test = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(form.data.whatsapp_text.ar.replace(":org", orgName))}`
    : null;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    form.put("/admin/social-links/whatsapp", { preserveScroll: true });
  };

  return (
    <Card title="زرّ واتساب العائم">
      <form onSubmit={submit} className="space-y-5">
        <Toggle label="إظهار زرّ واتساب في كلّ صفحات الموقع" checked={form.data.whatsapp_enabled}
          onChange={(v) => form.setData("whatsapp_enabled", v)}
          hint="يظهر في الركن السفلي: يسار الصفحة بالعربية، ويمينها بالإنجليزية والتركية. النقر يفتح محادثة واتساب بالنصّ الجاهز." />

        <fieldset disabled={!form.data.whatsapp_enabled} className={`space-y-4 ${form.data.whatsapp_enabled ? "" : "opacity-50"}`}>
          <div className="flex flex-wrap items-end gap-3">
            <TextField className="min-w-60 flex-1" label="رقم واتساب" dir="ltr" value={form.data.whatsapp_number}
              onChange={(v) => form.setData("whatsapp_number", v)} error={e.whatsapp_number}
              placeholder="+90 553 082 77 11" hint="دولياً مع مفتاح البلد." />
            {test && (
              <a href={test} target="_blank" rel="noreferrer"
                className="mb-6 inline-flex h-10 items-center rounded-lg border border-rule bg-paper px-4 text-sm font-bold text-green transition hover:border-green">
                جرّب المحادثة ↗
              </a>
            )}
          </div>
          {LANGS.map((l) => (
            <TextArea key={l.key} label={l.label} dir={l.dir} rows={2} value={form.data.whatsapp_text[l.key]}
              onChange={(v) => form.setData("whatsapp_text", { ...form.data.whatsapp_text, [l.key]: v })}
              error={e[`whatsapp_text.${l.key}`]} />
          ))}
          <p className="text-xs leading-6 text-ink/60">
            اكتب <span dir="ltr" className="font-mono font-bold">:org</span> ليُستبدل باسم التجمّع بلغة الصفحة. الحقل الفارغ يعود إلى النصّ الافتراضي.
          </p>
        </fieldset>

        <Button type="submit" disabled={form.processing || !form.isDirty}>حفظ إعداد واتساب</Button>
      </form>
    </Card>
  );
}
