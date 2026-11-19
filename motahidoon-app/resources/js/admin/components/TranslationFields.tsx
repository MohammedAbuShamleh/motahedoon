import type { Translations } from "../types";
import { LocaleTag, TextArea, TextField } from "./ui";

/**
 * حقول الترجمة الإنجليزية والتركية لنموذج. العربية في الحقول الأصلية.
 * أي تعديل هنا يُحفَظ بحالة «بانتظار المراجعة» حتى يعتمده المدير.
 */
export function TranslationFields({ fields, value, onChange, errors = {} }: {
  fields: { key: string; label: string; multiline?: boolean }[];
  value: Translations;
  onChange: (t: Translations) => void;
  errors?: Record<string, string | undefined>;
}) {
  const set = (locale: "en" | "tr", key: string, v: string) =>
    onChange({ ...value, [locale]: { ...value[locale], [key]: v } });

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {(["en", "tr"] as const).map((locale) => (
        <div key={locale} dir="ltr" className="space-y-3 rounded-lg border border-rule bg-rule/15 p-4 text-start">
          <p className="flex items-center gap-2 text-sm font-bold">
            <LocaleTag locale={locale} />
            {locale === "en" ? "English" : "Türkçe"}
          </p>
          {fields.map((f) => {
            const props = {
              label: f.label,
              value: value[locale]?.[f.key] ?? "",
              onChange: (v: string) => set(locale, f.key, v),
              error: errors[`translations.${locale}.${f.key}`],
              dir: "ltr" as const,
            };
            return f.multiline ? <TextArea key={f.key} {...props} rows={3} /> : <TextField key={f.key} {...props} />;
          })}
        </div>
      ))}
    </div>
  );
}
