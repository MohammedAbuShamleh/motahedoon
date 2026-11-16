import { useEffect } from "react";
import type { Locale } from "@/types";

/**
 * مزامنة سمات <html> مع اللغة.
 *
 * ضرورية مع Inertia: قالب Blade الجذر يُرسَم مرّة عند أول تحميل، فتنقّل
 * داخل التطبيق إلى ?lang=en لن يقلب dir وحده. هذا الخطّاف يقلبه.
 */
export function useDocumentLocale(locale: Locale): void {
  useEffect(() => {
    const html = document.documentElement;
    const ltr = locale !== "ar";
    html.lang = locale;
    html.dir = ltr ? "ltr" : "rtl";
    html.classList.toggle("is-ltr", ltr);
  }, [locale]);
}

/**
 * الشريط العائم يشتدّ بعد مغادرة أعلى الصفحة.
 * نقل حرفي عن app.js الثابت.
 */
export function useScrolled(): void {
  useEffect(() => {
    const onScroll = () =>
      document.documentElement.classList.toggle("is-scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);
}

/**
 * قياس ارتفاع تنويه «ترجمة غير معتمدة».
 *
 * التنويه مثبّت أعلى الكل، فاللوح العائم والمحتوى ينزاحان بقدر ارتفاعه.
 * القيمة تُكتب في --xb ويقرأها الـCSS.
 */
export function useBannerOffset(present: boolean): void {
  useEffect(() => {
    const html = document.documentElement;

    if (!present) {
      html.classList.remove("has-xbanner");
      html.style.removeProperty("--xb");
      return;
    }

    const measure = () => {
      const el = document.querySelector<HTMLElement>(".xbanner");
      if (!el) return;
      html.classList.add("has-xbanner");
      html.style.setProperty("--xb", `${el.offsetHeight}px`);
    };

    measure();
    addEventListener("resize", measure);
    return () => {
      removeEventListener("resize", measure);
      html.classList.remove("has-xbanner");
      html.style.removeProperty("--xb");
    };
  }, [present]);
}
