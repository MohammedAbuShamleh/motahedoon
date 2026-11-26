import { useEffect } from "react";

/**
 * الانتقال إلى المرساة بعد رسم الصفحة (2026-11-26).
 *
 * رابط «من نحن» من صفحة أخرى هو /#about: تحميل كامل يحاول فيه المتصفّح
 * القفز إلى #about فور وصول HTML — قبل أن يرسم React الأقسام، فلا يجد
 * العنصر ويبقى أعلى الرئيسية؛ والنقرة الثانية وحدها كانت تصل. هنا يُعاد
 * القفز بعد الرسم، ومرّة ثانية بعد تحميل الصور (قد تزيح التخطيط)، ويتوقّف
 * إن مرّر الزائر بنفسه. scroll-margin-top على الأقسام يحسب الشريط العائم.
 */
export function useHashScroll(key: string): void {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    };
    // تمرير الزائر بنفسه يُلغي المحاولات اللاحقة
    const stop = () => { cancelled = true; };
    const opts: AddEventListenerOptions = { passive: true, once: true };
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchstart", stop, opts);
    window.addEventListener("keydown", stop, opts);

    const raf = requestAnimationFrame(() => requestAnimationFrame(go));
    const onLoad = () => go();
    if (document.readyState === "complete") {
      window.setTimeout(go, 350);
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }
    const late = window.setTimeout(go, 900);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(late);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [key]);
}
