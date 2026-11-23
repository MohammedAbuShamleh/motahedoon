import { useEffect } from "react";

/**
 * عدّاد الزيارات (2026-11-23): مشاهدة لكلّ صفحة — ومنها التنقّل داخل الموقع
 * بلا إعادة تحميل (Inertia) — والأقسام التي ظهرت فعلاً على الشاشة.
 *
 * القسم يُعدّ مرّة في الزيارة حين يظهر 40% منه: كلّ section له id في المحتوى
 * الرئيسي، أو عنصر يحمل data-stat. تُجمع الأقسام وتُرسل دفعةً كلّ بضع ثوانٍ
 * وعند مغادرة الصفحة، بـ navigator.sendBeacon — لا ينتظر الرّد ولا يبطئ شيئاً.
 * لا ملفّ تعريف ولا بيانات شخصية؛ الخادم يجمع العدّ يومياً (VisitStats).
 */
const ENDPOINT = "/stats";

function beacon(body: Record<string, unknown>): void {
  const json = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([json], { type: "application/json" }))) return;
  } catch { /* يسقط إلى fetch */ }
  void fetch(ENDPOINT, { method: "POST", body: json, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}

export function useVisitStats(key: string, locale: string): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    beacon({ path, locale, view: true });

    const seen = new Set<string>();
    let pending: string[] = [];
    const flush = () => {
      if (!pending.length) return;
      beacon({ path, locale, sections: pending });
      pending = [];
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const id = el.dataset.stat || el.id;
          if (id && !seen.has(id)) { seen.add(id); pending.push(id); }
          io?.unobserve(el);
        }
      }, { threshold: 0.4 });
      // بعد رسم المحتوى: الأقسام موجودة في الشجرة
      requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>("#main section[id], #main [data-stat]")
          .forEach((el) => io?.observe(el));
      });
    }

    const timer = window.setInterval(flush, 5000);
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      flush();                                   // تنقّل داخل الموقع: أرسل ما تجمّع
      clearInterval(timer);
      io?.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [key, locale]);
}
