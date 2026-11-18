import type { InertiaFormProps } from "@inertiajs/react";

type AnyForm = Record<string, unknown>;

/**
 * يرسل النموذج FormData دائماً (لأن فيه ملفات أحياناً)، والطريقة الحقيقية
 * في _method — PHP لا يقرأ ملفات طلب PUT متعدّد الأجزاء.
 * المصفوفات بصيغة الفهارس x[0][value]: صيغة الأقواس x[][value] الافتراضية
 * يقرؤها PHP عناصرَ منفصلة فتتفكّك القوائم المتداخلة.
 */
export function send<T extends AnyForm>(
  form: InertiaFormProps<T>,
  method: "post" | "put",
  url: string,
  onSuccess?: () => void,
): void {
  form.transform((data) => ({ ...data, _method: method }));
  form.post(url, {
    forceFormData: true,
    queryStringArrayFormat: "indices",
    preserveScroll: true,
    onSuccess,
  });
}

/** null → "" لحقول الإدخال؛ والعكس يتكفّل به Laravel (ConvertEmptyStringsToNull). */
export const str = (v: string | null | undefined): string => v ?? "";

export function emptyTranslations(fields: string[]): { en: Record<string, string | null>; tr: Record<string, string | null> } {
  const blank = Object.fromEntries(fields.map((f) => [f, ""]));
  return { en: { ...blank }, tr: { ...blank } };
}

/** خطأ حقل متداخل من أخطاء Inertia (المفاتيح نقطية: metrics.0.value). */
export function err(errors: Record<string, string | undefined>, key: string): string | undefined {
  return errors[key];
}
