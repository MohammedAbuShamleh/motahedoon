import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * ستارة مقيسة لكلّ شريحة في الافتتاحية (2026-11-22).
 *
 * كانت ستارة واحدة معايَرة لصورة واحدة تحت سبع صور متبدّلة، فهبط تباين
 * النصّ فوق الفاتحة منها إلى 1.3:1. هنا تُقاس كلّ صورة بعد تحميلها: تُرسم
 * مصغّرةً في canvas بالقصّ نفسه (cover، ‏object-position ‏50% 42%)، وتُقرأ
 * بكسلات المنطقة التي تقع تحت كتلة العنوان وحدها، ثم يُحسب أخفّ تعتيم حبريّ
 * يرفع البكسل الأفتح (المئين 99، لا المتوسط) إلى 4.5:1 أمام النصّ الورقي.
 *
 * الناتج في CSS: --scrim على طبقة الشريحة (شدّتها)، و--scrim-end و--away
 * على القسم (أين تنتهي كتلة العنوان، وفي أيّ اتّجاه تخفت الستارة). الستارة منتظمة الشدّة
 * حتى --scrim-end ثم تخفت — فالقياس صادق على كلّ النصّ لا على مركزه.
 * إن تعذّر القياس بقيت القيمة الافتراضية في CSS.
 */

const PAPER = [252, 252, 250];
const INK = [26, 26, 26];
const TARGET = 4.5;          // نصّ ورقيّ عاديّ على الستارة (WCAG AA)
const MIN = 0.35, MAX = 0.9; // حدود الشدّة: لا ستارة شفّافة كلّياً ولا سوداء

const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const PAPER_L = lum(PAPER[0], PAPER[1], PAPER[2]);
const ratio = (l: number) => (PAPER_L + 0.05) / (l + 0.05);

/** أخفّ شدّة تبلغ بها الستارة الحبرية فوق هذا البكسل نسبة TARGET. */
function alphaFor(r: number, g: number, b: number): number {
  const at = (a: number) => lum(r + (INK[0] - r) * a, g + (INK[1] - g) * a, b + (INK[2] - b) * a);
  if (ratio(at(0)) >= TARGET) return 0;
  let lo = 0, hi = 1;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (ratio(at(mid)) >= TARGET) hi = mid; else lo = mid;
  }
  return hi;
}

export function useHeroScrim(ref: RefObject<HTMLElement | null>, count: number): void {
  useEffect(() => {
    const hero = ref.current;
    if (!hero) return;
    const card = hero.querySelector<HTMLElement>(".hero__card");
    const layers = [...hero.querySelectorAll<HTMLElement>(".hero__layer")];
    if (!card || !layers.length) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const measure = (layer: HTMLElement) => {
      const img = layer.querySelector("img");
      if (!img || !img.complete || !img.naturalWidth) return;

      const h = hero.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const k = 4;                                    // رسم مصغّر: ربع الأبعاد يكفي للقياس
      const w = Math.max(1, Math.round(h.width / k));
      const ht = Math.max(1, Math.round(h.height / k));
      canvas.width = w; canvas.height = ht;

      // القصّ نفسه الذي يرسمه CSS للصورة
      const s = Math.max(w / img.naturalWidth, ht / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      try {
        ctx.drawImage(img, (w - dw) * 0.5, (ht - dh) * 0.42, dw, dh);
        const x0 = Math.max(0, Math.floor((c.left - h.left) / k));
        const y0 = Math.max(0, Math.floor((c.top - h.top) / k));
        const x1 = Math.min(w, Math.ceil((c.right - h.left) / k));
        const y1 = Math.min(ht, Math.ceil((c.bottom - h.top) / k));
        if (x1 <= x0 || y1 <= y0) return;
        const { data } = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);

        // البكسل عند المئين 99 من الإضاءة: الأفتح بلا شذوذ نقطة واحدة
        const px: [number, number, number, number][] = [];
        for (let i = 0; i < data.length; i += 4) {
          px.push([lum(data[i], data[i + 1], data[i + 2]), data[i], data[i + 1], data[i + 2]]);
        }
        px.sort((a, b) => a[0] - b[0]);
        const [, r, g, b] = px[Math.min(px.length - 1, Math.floor(px.length * 0.99))];
        const a = Math.min(MAX, Math.max(MIN, alphaFor(r, g, b)));
        layer.style.setProperty("--scrim", a.toFixed(2));
      } catch {
        /* صورة من أصل آخر أو متصفّح يمنع القراءة: تبقى الشدّة الافتراضية */
      }
    };

    // اتّجاه الستارة ونهايتها: من جهة البدء حتى نهاية كتلة العنوان؛ وحين
    // تملأ الكتلة العرض (الجوّال) من الأعلى حتى أسفلها
    const edge = () => {
      const h = hero.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const rtl = getComputedStyle(hero).direction === "rtl";
      const wide = c.width > h.width * 0.8;
      const end = wide
        ? (c.bottom - h.top) / h.height
        : (rtl ? h.right - c.left : c.right - h.left) / h.width;
      hero.style.setProperty("--away", wide ? "bottom" : rtl ? "left" : "right");
      hero.style.setProperty("--scrim-end", `${Math.min(100, end * 100).toFixed(1)}%`);
    };

    const all = () => { edge(); layers.forEach(measure); };
    const onLoad = (e: Event) => {
      const layer = (e.target as HTMLElement).closest<HTMLElement>(".hero__layer");
      if (layer) measure(layer);
    };

    layers.forEach((l) => l.querySelector("img")?.addEventListener("load", onLoad));
    let t = 0;
    const onResize = () => { clearTimeout(t); t = window.setTimeout(all, 200); };
    addEventListener("resize", onResize);
    // بعد استقرار الخطّ والتخطيط: كتلة العنوان بمقاسها النهائي
    void document.fonts?.ready.then(all);
    all();

    return () => {
      clearTimeout(t);
      removeEventListener("resize", onResize);
      layers.forEach((l) => l.querySelector("img")?.removeEventListener("load", onLoad));
    };
  }, [ref, count]);
}
