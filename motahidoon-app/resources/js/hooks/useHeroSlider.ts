import { useCallback, useEffect, useRef, useState } from "react";

/**
 * سلايدر الافتتاحية.
 *
 * نقل لـ heroSlider() في app.js الثابت. الصور تُدار **بالمرجع لا بالحالة**
 * عن قصد: الكشف يحتاج تسلسلاً إجرائياً — إعادة الطبقة إلى حالة القصّ بلا
 * انتقال، ثم رفع z-index، ثم إجبار إعادة التدفّق، ثم الكشف. إعادة رسم
 * React تضع الصنف النهائي دفعةً واحدة فلا يجري أي انتقال.
 *
 * أما النصّ والمؤشّرات فيتبعان الحالة `at` تصريحياً — لا يحتاجان التسلسل.
 *
 * الطبقات السابقة تبقى مكشوفة تحت الجديدة، والترتيب بـz-index لا بترتيب
 * العناصر — فالرجوع إلى شريحة سابقة يعمل كالتقدّم سواء.
 */
export function useHeroSlider(
  ref: React.RefObject<HTMLElement | null>,
  count: number,
  dwell = 7000,
): { at: number; go: (k: number) => void; take: () => void } {
  const [at, setAt] = useState(0);
  const z = useRef(1);
  const timer = useRef<number>(0);
  const held = useRef(false);
  const took = useRef(false);
  const atRef = useRef(0);

  const go = useCallback(
    (k: number) => {
      const host = ref.current;
      if (!host || count < 2) return;
      k = (k + count) % count;
      if (k === atRef.current) return;

      const layers = host.querySelectorAll<HTMLElement>(".hero__layer");
      const load = (i: number) => {
        const img = layers[i]?.querySelector<HTMLImageElement>("img[data-src]");
        if (img?.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
      };
      load(k);
      load((k + 1) % count);

      const l = layers[k];
      if (l) {
        l.classList.remove("is-on");
        l.style.transition = "none";
        void l.offsetWidth;
        l.style.zIndex = String(++z.current);
        l.style.transition = "";
        void l.offsetWidth;
        l.classList.add("is-on");
      }

      atRef.current = k;
      setAt(k);
    },
    [ref, count],
  );

  /* أول تدخّل من المستخدم يوقف الدوران نهائياً: هو آلية الإيقاف التي
     يوجبها معيار الوصول لكل محتوى يتحرّك تلقائياً. */
  const take = useCallback(() => {
    took.current = true;
    clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    const host = ref.current;
    if (!host || count < 2) return;

    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* الصورة الثانية تُحمَّل مسبقاً، والبقية عند الحاجة */
    const first = host.querySelector<HTMLImageElement>(
      ".hero__layer:nth-child(2) img[data-src]",
    );
    if (first?.dataset.src) {
      first.src = first.dataset.src;
      first.removeAttribute("data-src");
    }

    const plan = () => {
      clearTimeout(timer.current);
      if (calm || took.current) return;
      timer.current = window.setTimeout(() => {
        if (!held.current && !document.hidden) go(atRef.current + 1);
        plan();
      }, dwell);
    };

    /* القراءة على البطاقة توقف العدّ، لا المرور فوق الصورة كلها */
    const card = host.querySelector(".hero__card");
    const hold = () => { held.current = true; };
    const free = () => { held.current = false; };
    card?.addEventListener("pointerenter", hold);
    card?.addEventListener("pointerleave", free);
    host.addEventListener("focusin", hold);
    host.addEventListener("focusout", free);

    plan();

    return () => {
      clearTimeout(timer.current);
      card?.removeEventListener("pointerenter", hold);
      card?.removeEventListener("pointerleave", free);
      host.removeEventListener("focusin", hold);
      host.removeEventListener("focusout", free);
    };
  }, [ref, count, dwell, go]);

  return { at, go, take };
}
