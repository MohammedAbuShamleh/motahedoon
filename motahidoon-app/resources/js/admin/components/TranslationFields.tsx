import type { Translations } from "../types";
import { RichEditor } from "./RichEditor";
import { LOCALE_NAME, LocaleTag, TextArea, TextField } from "./ui";

/**
 * حقول الترجمة الإنجليزية والتركية لنموذج. العربية في الحقول الأصلية.
 * أي تعديل هنا يُحفَظ بحالة «بانتظار المراجعة» حتى يعتمده المدير.
 * العناوين عربية واللوح بالاتجاه العربي؛ خانات الكتابة وحدها لاتينية الاتجاه.
 */
export function TranslationFields({ fields, value, onChange, errors = {} }: {
  /** rich: محرّر منسَّق بالاتجاه اللاتيني، كحقله العربي */
  fields: { key: string; label: string; multiline?: boolean; rich?: boolean }[];
  value: Translations;
  onChange: (t: Translations) => void;
  errors?: Record<string, string | undefined>;
}) {
  const set = (locale: "en" | "tr", key: string, v: string) =>
    onChange({ ...value, [locale]: { ...value[locale], [key]: v } });

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {(["en", "tr"] as const).map((locale) => (
        <div key={locale} className={`space-y-3 rounded-lg border border-rule border-t-[3px] bg-rule/15 p-4 ${locale === "en" ? "border-t-green" : "border-t-olive"}`}>
          <p className="flex items-center gap-2 text-sm font-bold">
            <LocaleTag locale={locale} />
            {LOCALE_NAME[locale]}
          </p>
          {fields.map((f) => {
            const props = {
              label: f.label,
              value: value[locale]?.[f.key] ?? "",
              onChange: (v: string) => set(locale, f.key, v),
              error: errors[`translations.${locale}.${f.key}`],
              dir: "ltr" as const,
            };
            if (f.rich) return <RichEditor key={f.key} {...props} compact lazy />;
            return f.multiline ? <TextArea key={f.key} {...props} rows={3} /> : <TextField key={f.key} {...props} />;
          })}
        </div>
      ))}
    </div>
  );
}
