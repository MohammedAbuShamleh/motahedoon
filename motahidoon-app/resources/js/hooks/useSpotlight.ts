import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";

/**
 * عارض «واحد في كلّ مرّة» بترتيب ثابت — «مجالات العمل» و«من الميدان».
 *
 * التقدّم التلقائي يقوده شريط التقدّم نفسه: حركة الملء في CSS بمدّة المكث،
 * وعند نهايتها (animationend → next) يتقدّم العارض. فالشريط والتبديل
 * متزامنان دائماً، والإيقاف المؤقّت إيقافٌ للحركة نفسها (play-state) يُستأنف
 * من حيث توقّف. يتوقّف تحت المؤشّر والتركيز، وحين يغيب القسم عن الشاشة أو
 * يُخفى التبويب. مع «تقليل الحركة» تُلغى الحركات كلّها في CSS فلا تنتهي
 * حركة ولا يتقدّم شيء وحده — التنقّل باليد وحده. لا زرّ إيقاف ظاهر (قرار
 * صاحب المشروع). الترتيب متتابع دائماً: لا قفز عشوائي.
 *
 * الأسهم في لوحة المفاتيح بصرية: في العربية السهم الأيسر يتقدّم. والسحب
 * باللمس كذلك. حالة كلّ شريحة: «is-on» الحالية، و«was-on» السابقة (تبقى
 * تحت الجديدة حتى تكتمل حركتها)، والبقية مخفية.
 */
export function useSpotlight(count: number, opts: { axis?: "x" | "y" } = {}) {
  /* x: عارض أفقي (الأسهم ←→ والسحب). y: فهرس رأسي (الأسهم ↑↓، بلا سحب —
     السحب الرأسي لتمرير الصفحة) */
  const axis = opts.axis ?? "x";
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [held, setHeld] = useState(false);
  const [seen, setSeen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = useRef(0);
  const startX = useRef<number | null>(null);

  /* يتقدّم ما دام ظاهراً بما يكفي: خُمسه على الأقل، أو ما يملأ خُمسَي ارتفاع
     الشاشة — العارض أطول من الشاشة على الجوّال الأفقي فلا يبلغ نسبة ثابتة */
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => {
      setSeen(e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= innerHeight * 0.4));
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const go = useCallback((i: number, d?: "fwd" | "back") => {
    const n = ((i % count) + count) % count;
    if (n === cur.current) return;
    setDir(d ?? (n > cur.current ? "fwd" : "back"));
    setPrev(cur.current);
    cur.current = n;
    setIndex(n);
  }, [count]);
  const next = useCallback(() => go(cur.current + 1, "fwd"), [go]);
  const back = useCallback(() => go(cur.current - 1, "back"), [go]);

  const playing = count > 1 && seen && !held && !hidden;
  const rtl = () => document.documentElement.dir === "rtl";

  const bind = {
    ref,
    onPointerEnter: (e: PointerEvent<HTMLDivElement>) => { if (e.pointerType === "mouse") setHeld(true); },
    onPointerLeave: (e: PointerEvent<HTMLDivElement>) => { if (e.pointerType === "mouse") setHeld(false); },
    onFocus: () => setHeld(true),
    onBlur: (e: FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
    },
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (axis === "y") {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        if (e.key === "ArrowDown") next(); else back();
        return;
      }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      if (e.key === (rtl() ? "ArrowLeft" : "ArrowRight")) next(); else back();
    },
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (axis === "x" && e.pointerType !== "mouse") startX.current = e.clientX;
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      startX.current = null;
      if (Math.abs(dx) < 48) return;
      if (rtl() ? dx > 0 : dx < 0) next(); else back();
    },
    onPointerCancel: () => { startX.current = null; },
  };

  const state = (i: number) => (i === index ? "is-on" : i === prev ? "was-on" : "");

  return { index, dir, playing, go, next, back, bind, state };
}
