import { useEffect, useMemo, useRef, useState } from "react";

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/**
 * نافذة منزلقة على قائمة دائرية: تُظهر `slots` عناصر متتالية بترتيبها،
 * وكل `tick` ملّي ثانية تتقدّم `step` عناصر — يخرج أوّل `step` ويدخل
 * `step` جديدة بعد آخرها، ويبقى الباقي بترتيبه. مع سبعة مجالات وأربع خانات
 * وخطوة 2: تتبدّل بطاقتان في كل مرّة، والظاهر دائماً متتالٍ مرتّب
 * (01 02 03 04 ← 03 04 05 06 ← 05 06 07 01 …)، وتمرّ المجالات كلّها بالتساوي.
 * (كان يُستبدل بطاقةً واحدة في خانة الأقدم ظهوراً، فيبدو الترتيب عشوائياً.)
 *
 * onBeforeStep يُستدعى قبيل كل تقدّم — ليقيس المكوّن مواضع البطاقات الباقية
 * فيحرّكها إلى أماكنها الجديدة بسلاسة. يتوقّف ما دامت hold(true) أو الصفحة
 * مخفية، ولا يدور أصلاً مع «تقليل الحركة» (calm). العدد مشتقّ من البيانات:
 * count ≤ slots لا دوران؛ وإن قلّ count عن slots + step تبدّل أقلّ من step.
 */
export function useCardCycle(
  count: number,
  slots: number,
  { step = 2, tick = 5000, onBeforeStep }: { step?: number; tick?: number; onBeforeStep?: () => void } = {},
) {
  const visible = Math.min(count, slots);
  const calm = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const rotates = count > slots && !calm;
  /* طول الدورة: عدد النوافذ المختلفة قبل العودة إلى البداية (7 مع خطوة 2).
     pos رقم الخطوة الحالية فيها — مؤشّر ترقيم يتقدّم واحداً واحداً بالترتيب */
  const cycle = rotates ? count / gcd(count, step) : 0;
  const [start, setStart] = useState(0);
  const [pos, setPos] = useState(0);
  const held = useRef(false);
  const before = useRef(onBeforeStep);

  useEffect(() => { before.current = onBeforeStep; });

  // تغيّر العدد (تحرير من اللوحة): تعود النافذة إلى البداية
  useEffect(() => { setStart(0); setPos(0); }, [count]);

  useEffect(() => {
    if (!rotates) return;
    const t = window.setInterval(() => {
      if (held.current || document.hidden) return;
      before.current?.();
      setStart((s) => (s + step) % count);
      setPos((p) => (p + 1) % cycle);
    }, tick);
    return () => window.clearInterval(t);
  }, [rotates, count, step, tick, cycle]);

  const shown = useMemo(
    () => Array.from({ length: visible }, (_, i) => (start + i) % count),
    [start, visible, count],
  );

  return {
    shown,
    start,
    pos,
    cycle,
    rotates,
    calm,
    hold: (on: boolean) => { held.current = on; },
  };
}
