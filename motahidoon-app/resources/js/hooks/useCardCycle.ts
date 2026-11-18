import { useEffect, useMemo, useRef, useState } from "react";

/**
 * يعرض `slots` من `count` عنصراً، ويستبدل كل `tick` ملّي ثانية أقدمَ خانةٍ
 * ظهوراً بالعنصر التالي في التسلسل. المعروض دائماً آخر `slots` عناصر دخلت،
 * والتالي هو الأطول غياباً — فتمرّ العناصر كلّها بالتساوي، ولا يظهر عنصر في
 * خانتين ما دام count > slots.
 *
 * يتوقّف ما دامت hold(true) (المؤشّر أو التركيز فوق القسم) أو الصفحة مخفية،
 * ولا يدور أصلاً مع «تقليل الحركة» — وحينها `calm` صحيحة ليعرض المكوّن
 * العناصر كلّها ثابتة. العدد مشتقّ من البيانات: count ≤ slots لا دوران.
 */
export function useCardCycle(count: number, slots: number, tick = 4200) {
  const visible = Math.min(count, slots);
  const calm = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const rotates = count > slots && !calm;
  const [shown, setShown] = useState<number[]>(() => Array.from({ length: visible }, (_, i) => i));
  const held = useRef(false);
  const cursor = useRef({ slot: 0, next: visible });

  // تغيّر العدد (تحرير من اللوحة): يُعاد الضبط من البداية
  useEffect(() => {
    setShown(Array.from({ length: visible }, (_, i) => i));
    cursor.current = { slot: 0, next: visible };
  }, [count, visible]);

  useEffect(() => {
    if (!rotates) return;
    const t = window.setInterval(() => {
      if (held.current || document.hidden) return;
      const { slot, next } = cursor.current;
      cursor.current = { slot: (slot + 1) % visible, next: (next + 1) % count };
      setShown((s) => s.map((v, i) => (i === slot ? next : v)));
    }, tick);
    return () => window.clearInterval(t);
  }, [rotates, visible, count, tick]);

  return {
    shown,
    rotates,
    calm,
    hold: (on: boolean) => { held.current = on; },
  };
}
