import { useEffect } from "react";

/**
 * لحظة ظهور واحدة، بطيئة.
 *
 * ثلاث حرّاسات، كلٌّ منها يسدّ طريقاً إلى صفحة بيضاء:
 *
 * ١. **ما هو في الشاشة عند التهيئة يُكشف فوراً وبشكل متزامن**، بلا انتظار
 *    المراقب. نداؤه الأول غير متزامن، وقد يتأخّر أو لا يصل أصلاً في لسان
 *    خلفي أو سياق مخنوق الإطارات — فيبقى ما تراه العين مخفيّاً.
 *
 * ٢. `fired` تعني «المراقب حيّ» لا «عنصر تقاطع». المراقب يسلّم نداءً أول
 *    لكل عنصر مرصود ولو لم يتقاطع، فإن وصل فهو يعمل ولا حاجة للحارس.
 *    (في النسخة السابقة كانت تعني التقاطع، فصفحة لا شيء فيها ظاهر ابتداءً
 *    كانت تُشغّل showAll وتفقد الحركة كلها.)
 *
 * ٣. حارس زمني عند 600ms — لا 2000: ثانيتان بيضاوان عطلٌ يُرى، لا احتياط.
 *
 * تُلغى كلياً مع prefers-reduced-motion. وتُعاد عند كل تنقّل، لأن Inertia
 * يستبدل المحتوى دون إعادة تحميل فالعقد الجديدة تحتاج مراقباً جديداً.
 */
export function useReveal(key: string): void {
  useEffect(() => {
    const html = document.documentElement;
    const items = document.querySelectorAll<HTMLElement>(".reveal");

    const showAll = () => {
      html.classList.remove("js-reveal");
      items.forEach((n) => n.classList.add("is-in"));
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      showAll();
      return;
    }

    html.classList.add("js-reveal");
    let alive = false;

    const io = new IntersectionObserver(
      (entries) => {
        alive = true;                       // وصل نداء: المراقب يعمل
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const near = innerHeight * 1.15;
    items.forEach((n) => {
      if (n.getBoundingClientRect().top < near) {
        n.classList.add("is-in");           // في الشاشة: فوراً، بلا انتظار
      } else {
        io.observe(n);
      }
    });

    const guard = window.setTimeout(() => { if (!alive) showAll(); }, 600);

    return () => {
      clearTimeout(guard);
      io.disconnect();
      html.classList.remove("js-reveal");
    };
  }, [key]);
}

/** تتابع داخل الحاوية: كل ابن يتأخر قليلاً عن سابقه. */
export function useStagger(key: string): void {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".stagger").forEach((c) => {
      [...c.children].forEach((ch, i) =>
        (ch as HTMLElement).style.setProperty("--i", String(Math.min(i, 11))),
      );
    });
  }, [key]);
}

/** شريط الصور: أظهر مؤشّر «يُمرَّر» ما دام فيه بقية. */
export function useFilmstrip(key: string): void {
  useEffect(() => {
    const strips = document.querySelectorAll<HTMLElement>(".film__strip");
    const syncs: [HTMLElement, () => void][] = [];

    strips.forEach((st) => {
      const sync = () => {
        const end =
          Math.abs(st.scrollLeft) + st.clientWidth >= st.scrollWidth - 4;
        st.classList.toggle("is-end", end);
      };
      st.addEventListener("scroll", sync, { passive: true });
      sync();
      syncs.push([st, sync]);
    });

    return () => syncs.forEach(([st, sync]) => st.removeEventListener("scroll", sync));
  }, [key]);
}
