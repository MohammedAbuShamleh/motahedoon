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

/** رابط يحافظ على اللغة الحالية. */
export function useLocalized(): (path: string) => string {
  const { locale } = useSite();
  return (path) => (locale === "ar" ? path : `${path}?lang=${locale}`);
}
