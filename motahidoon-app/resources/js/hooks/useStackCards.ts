import { useEffect, useRef } from "react";

/**
 * بطاقات متراكبة بالتمرير — فصول المجالات في صفحة التقرير.
 *
 * كلّ بطاقة ملتصقة (sticky) بملء الشاشة، والتالية تصعد فوقها. هذا الخطّاف
 * يضيف أمرين لا يقدر عليهما CSS وحده:
 *
 * ١. **--cover** (0 → 1): كم غطّت البطاقةُ التاليةُ هذه. يقود تصغيراً
 *    وتعتيماً خفيفين للبطاقة المغطّاة فيُقرأ التراكب عمقاً.
 *
 * ٢. **--stick**: موضع الالتصاق. البطاقة الأطول من الشاشة (متن طويل على
 *    الجوّال) لو التصقت عند 0 لغطّت التاليةُ أسفلها قبل أن يُقرأ؛ فتلتصق
 *    عند (ارتفاع الشاشة − ارتفاعها) أي بعد أن يظهر أسفلها كاملاً.
 *
 * مع «تقليل الحركة» يبقى التراكب (تخطيطٌ يقوده تمرير القارئ) ويُلغى
 * التصغير والتعتيم. التحديث في إطار رسم واحد لكلّ دفعة تمرير.
 */
export function useStackCards<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards = [...root.querySelectorAll<HTMLElement>(":scope > [data-stack]")];
    if (!cards.length) return;

    const still = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const measure = () => {
      const vh = innerHeight;
      cards.forEach((c) => {
        c.style.setProperty("--stick", `${Math.min(0, vh - c.offsetHeight)}px`);
      });
    };

    const paint = () => {
      raf = 0;
      if (still.matches) return;
      const vh = innerHeight;
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        const k = next
          ? Math.min(1, Math.max(0, (vh - next.getBoundingClientRect().top) / vh))
          : 0;
        c.style.setProperty("--cover", k.toFixed(3));
      });
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const onResize = () => { measure(); onScroll(); };

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    cards.forEach((c) => ro?.observe(c));

    measure();
    paint();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      cards.forEach((c) => { c.style.removeProperty("--cover"); c.style.removeProperty("--stick"); });
    };
  }, [key]);   // Inertia يبدّل التقرير دون فكّ المكوّن: بطاقات جديدة، مراقبة جديدة

  return ref;
}
