import { useEffect } from "react";

/**
 * بريق الزجاج يتبع المؤشّر.
 *
 * مستمع واحد على المستند كلّه لا مستمع لكل سطح: يجد أقرب ‎.glass‎ تحت
 * المؤشّر، ويكتب موضعه النسبي في ‎--gx/--gy‎، ويضيف ‎is-lit‎ فيظهر
 * ::after (انظر نظام الزجاج في style.css).
 *
 * الكتابة داخل requestAnimationFrame: إطار واحد مهما تكاثرت الأحداث.
 * لا يعمل للّمس ولا مع «تقليل الحركة» — البريق زينة لا وظيفة.
 */
export function useGlassSheen(): void {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let lit: HTMLElement | null = null;
    let frame = 0;
    let x = 0;
    let y = 0;
    let target: EventTarget | null = null;

    const paint = () => {
      frame = 0;
      const el =
        target instanceof Element ? target.closest<HTMLElement>(".glass") : null;

      if (lit && lit !== el) lit.classList.remove("is-lit");
      lit = el;
      if (!el) return;

      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${((x - r.left) / r.width) * 100}%`);
      el.style.setProperty("--gy", `${((y - r.top) / r.height) * 100}%`);
      el.classList.add("is-lit");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      target = e.target;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      lit?.classList.remove("is-lit");
      lit = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, []);
}
