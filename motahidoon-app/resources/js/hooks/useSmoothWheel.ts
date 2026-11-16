import { useEffect } from "react";

/**
 * تنعيم التمرير — تخميد أُسّي على عجلة الفأرة وحدها.
 *
 * نقل حرفي لـ smoothWheel() في app.js الثابت، بقياساته المتحقَّق منها:
 * رمية 400px تهبط على 400 بالضبط، وخمس نقرات ×120 تتراكم إلى 600.
 *
 * ما عدا العجلة يُترك كما هو: اللمس له قصوره الذاتي الأصلي وخطفه يفسده،
 * ولوحة المفاتيح وروابط المراسي تبقى على scroll-behavior: smooth.
 * التمرير أصلي — لا تحريك للـbody بـtransform — فالترويسة position: fixed
 * تبقى سليمة. يُلغى كلياً مع prefers-reduced-motion.
 */
export function useSmoothWheel(): void {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(pointer: fine)").matches) return;   // اللمس له نعومته

    /* behavior:"instant" يتجاوز scroll-behavior: smooth لكل إطار على حدة،
       فلا نقلب خاصية في الـCSS ولا يبقى شيء عالقاً إن غابت إطارات الرسم.
       إن لم يدعمه المتصفح فلا تنعيم — والتمرير الأصلي سليم كما هو. */
    try {
      scrollTo({ top: scrollY, behavior: "instant" });
    } catch {
      return;
    }

    /* مقبضان للضبط:
       TAU  ثابت التخميد بالملّي ثانية — أكبر = أبطأ وأنعم.
       MULT مضاعف مسافة النقرة — يُترك 1 حتى لا تثقل الصفحة. */
    const TAU = 150;
    const MULT = 1;

    let target = scrollY;
    let pos = scrollY;
    let last = 0;
    let began = 0;
    let running = false;

    const put = (y: number) => scrollTo({ top: y, behavior: "instant" });
    const limit = () =>
      Math.max(0, document.documentElement.scrollHeight - innerHeight);

    const step = (t: number) => {
      if (!running) return;
      /* الحدّ 200ms لا 50: مع سقوط الإطارات يلحق التخميد نفسه بالزمن
         الحقيقي بدل أن يتقدّم بالإطار فيبطؤ بطئاً غير مقصود. */
      const dt = Math.min(last ? t - last : 16, 200);
      last = t;
      const diff = target - pos;
      /* حارس زمني: إن تعثّرت الإطارات طويلاً بعد آخر نقرة، أنهِ ولا تعلق */
      if (Math.abs(diff) < 0.5 || t - began > 2500) {
        pos = target;
        put(pos);
        running = false;
        last = 0;
        return;
      }
      pos += diff * (1 - Math.exp(-dt / TAU));
      put(pos);
      requestAnimationFrame(step);
    };

    /* منطقة لها تمريرها الرأسي الخاص لا تُخطف منها العجلة */
    const ownsScroll = (el: Element | null): boolean => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        if (n.scrollHeight > n.clientHeight + 1) {
          const o = getComputedStyle(n).overflowY;
          if (o === "auto" || o === "scroll") return true;
        }
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return;      // تكبير الصفحة
      if (ownsScroll(e.target as Element)) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? innerHeight : 1;
      if (!running) {
        pos = target = scrollY;
        running = true;
        last = 0;
        requestAnimationFrame(step);
      }
      began = performance.now();
      target = Math.min(limit(), Math.max(0, target + e.deltaY * unit * MULT));
    };

    /* تمرير من مصدر آخر — لوحة مفاتيح، مرساة، شريط التمرير — يعيد المزامنة */
    const onScroll = () => {
      if (!running) pos = target = scrollY;
    };
    /* نقرة أو مفتاح: أفلت المقبض فوراً ولا تنازع المستخدم */
    const release = () => {
      running = false;
      last = 0;
    };

    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("keydown", release, { passive: true });
    addEventListener("pointerdown", release, { passive: true });

    return () => {
      running = false;
      removeEventListener("wheel", onWheel);
      removeEventListener("scroll", onScroll);
      removeEventListener("keydown", release);
      removeEventListener("pointerdown", release);
    };
  }, []);
}
