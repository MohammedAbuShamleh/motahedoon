import { usePage } from "@inertiajs/react";
import type { SharedProps } from "@/types";

/** الخصائص المشتركة: اللغة، نصوص الواجهة، الهوية، التواصل. */
export function useSite(): SharedProps {
  return usePage<SharedProps>().props;
}

/**
 * ترجمة نصّ واجهة. نقل حرفي لـ U() في app.js:
 * المفتاح هو النصّ العربي نفسه، وغيابُ الترجمة يُرجع العربية.
 */
export function useU(): (key: string) => string {
  const { ui } = useSite();
  return (key) => ui?.[key] ?? key;
}

/**
 * صيغ المعدود في العربية، والمفتاح العربي لكلّ صيغة نصُّ واجهة يُترجَم كغيره:
 *   one  1 وما ينتهي بـ 00/01/02 فوق المئة («بند»)
 *   two  2 («بندان»)
 *   few  3–10 وما ينتهي بها («بنود»، جمع)
 *   many 11–99 وما ينتهي بها («بنداً»، مفرد منصوب)
 */
export interface CountForms { one: string; two: string; few: string; many: string }

export function arabicForm(n: number): keyof CountForms {
  const r = Math.abs(Math.trunc(n)) % 100;
  if (n === 1) return "one";
  if (n === 2) return "two";
  if (r >= 3 && r <= 10) return "few";
  if (r >= 11) return "many";
  return "one";
}

/** نصّ المعدود الصحيح للعدد n، مترجماً للغة النشطة. */
export function useCount(): (n: number, forms: CountForms) => string {
  const U = useU();
  return (n, forms) => U(forms[arabicForm(n)]);
}

/** صيغ المعدودات المستعملة في الواجهة — مكان واحد، فلا تتكرّر في المكوّنات. */
export const COUNTS = {
  items:    { one: "بند", two: "بندان", few: "بنود", many: "بنداً" },
  paras:    { one: "فقرة", two: "فقرتان", few: "فقرات", many: "فقرة" },
  umbrella: { one: "مؤسسة في المظلة", two: "مؤسستان في المظلة", few: "مؤسسات في المظلة", many: "مؤسسة في المظلة" },
  photos:   { one: "صورة معتمدة", two: "صورتان معتمدتان", few: "صور معتمدة", many: "صورة معتمدة" },
  areas:    { one: "مجال دائم", two: "مجالان دائمان", few: "مجالات دائمة", many: "مجالاً دائماً" },
  reports:  { one: "تقرير منشور", two: "تقريران منشوران", few: "تقارير منشورة", many: "تقريراً منشوراً" },
  partners: { one: "مؤسسة شريكة", two: "مؤسستان شريكتان", few: "مؤسسات شريكة", many: "مؤسسة شريكة" },
  pillars:  { one: "مجال عمل", two: "مجالا عمل", few: "مجالات عمل", many: "مجال عمل" },
} satisfies Record<string, CountForms>;

/** رابط يحافظ على اللغة الحالية. */
export function useLocalized(): (path: string) => string {
  const { locale } = useSite();
  return (path) => (locale === "ar" ? path : `${path}?lang=${locale}`);
}
