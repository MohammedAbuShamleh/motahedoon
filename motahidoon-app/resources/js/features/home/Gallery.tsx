import { useCallback, useEffect, useRef, useState } from "react";
import { useU } from "@/lib/site";
import { Fact, SectionHead } from "@/components/primitives";

/* ---------- من الميدان: معرض صور متجدّد ----------
   خمس خانات فقط: الأولى كبيرة (عمودان × صفّان) وأربع بجانبها — صفّان
   متوازنان بلا فراغ. الصور كلّها تمرّ على الخانات: كلّ 3.5 ثوانٍ تتبدّل
   خانة واحدة بترتيب متغيّر، بتلاشٍ متقاطع هادئ، فلا يتغيّر المعرض دفعة.
   لا تعليق لكل صورة — لا يُخترع وصف ولا يُذكر موقع (قاعدة المحتوى).
   النقر يفتح العارض على الصورة المعروضة، ويتصفّح الصور كلّها. */

const TILES = 5;
const TICK = 3500;
/* ترتيب تبديل الخانات: متغيّر لا متتابع، والكبيرة أقلّها تبدّلاً */
const ORDER = [1, 3, 0, 4, 2, 1, 4, 3, 2];

/** يدير أيّ صورة في أيّ خانة، ويبدّل خانة واحدة كلّ دورة. */
function useRotation(count: number) {
  const [shown, setShown] = useState<number[]>(() =>
    Array.from({ length: Math.min(count, TILES) }, (_, i) => i));
  const next = useRef(TILES);
  const step = useRef(0);
  const held = useRef(false);

  useEffect(() => {
    if (count <= TILES) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (held.current || document.hidden) return;
      setShown((cur) => {
        // أوّل صورة غير معروضة الآن، بالدور
        let pick = next.current % count;
        while (cur.includes(pick)) pick = (pick + 1) % count;
        next.current = pick + 1;
        const tile = ORDER[step.current++ % ORDER.length];
        const out = [...cur];
        out[tile] = pick;
        return out;
      });
    }, TICK);
    return () => window.clearInterval(timer);
  }, [count]);

  return { shown, hold: (v: boolean) => { held.current = v; } };
}

/** صورة خانة بتلاشٍ متقاطع: السابقة تبقى تحت الجديدة حتى تكتمل. */
function TileImage({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  const [layers, setLayers] = useState<{ cur: string; prev: string | null }>({ cur: src, prev: null });

  useEffect(() => {
    if (src === layers.cur) return;
    // تحميل مسبق: لا تبدأ الحركة إلا والصورة جاهزة، فلا تومض الخانة فارغة
    const img = new Image();
    img.onload = () => setLayers((l) => ({ cur: src, prev: l.cur }));
    img.src = `/${src}`;
  }, [src, layers.cur]);

  return (
    <>
      {layers.prev && <img className="fgal__img is-prev" src={`/${layers.prev}`} alt="" aria-hidden="true" />}
      <img key={layers.cur} className="fgal__img is-cur" src={`/${layers.cur}`} alt={alt}
        loading={eager ? "eager" : "lazy"} decoding="async" />
    </>
  );
}

export function FieldGallery({ photos }: { photos: string[] }) {
  const U = useU();
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const { shown, hold } = useRotation(photos.length);
  if (!photos.length) return null;

  const alt = U("من التوثيق الميداني للتجمع");

  return (
    <section className="band band--tight fgal" id="field">
      <div className="sec__in">
        <SectionHead
          title={U("من الميدان")}
          side={<Fact value={String(photos.length)} label={U("صور معتمدة")} />}
        />
      </div>

      <div
        className="fgal__wrap reveal"
        onPointerEnter={() => hold(true)}
        onPointerLeave={() => hold(false)}
        onFocus={() => hold(true)}
        onBlur={() => hold(false)}
      >
        <ul className={`fgal__grid fgal__grid--${shown.length} stagger`}>
          {shown.map((pi, t) => (
            <li key={t} className={t === 0 ? "fgal__item is-lead" : "fgal__item"}>
              <button
                type="button"
                className="fgal__btn"
                aria-label={`${U("عرض الصورة")} ${pi + 1}`}
                onClick={(e) => { opener.current = e.currentTarget; setOpen(pi); }}
              >
                <TileImage src={photos[pi]} alt={alt} eager={t < 3} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open !== null && (
        <Lightbox
          photos={photos}
          index={open}
          alt={alt}
          onIndex={setOpen}
          onClose={() => { setOpen(null); opener.current?.focus(); }}
        />
      )}
    </section>
  );
}

/** عارض بملء الشاشة: السابق والتالي، والأسهم وEsc، وقفل تمرير الصفحة. */
function Lightbox({ photos, index, alt, onIndex, onClose }: {
  photos: string[];
  index: number;
  alt: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const U = useU();
  const closeRef = useRef<HTMLButtonElement>(null);
  const n = photos.length;
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // الاتجاه بصري: في RTL السهم الأيسر يتقدّم
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={U("من الميدان")} onClick={onClose}>
      <figure className="lightbox__fig" onClick={(e) => e.stopPropagation()}>
        <img key={photos[index]} src={`/${photos[index]}`} alt={alt} />
      </figure>

      <button ref={closeRef} type="button" className="lightbox__close" aria-label={U("إغلاق")} onClick={onClose}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {n > 1 && (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" aria-label={U("الصورة السابقة")}
            onClick={(e) => { e.stopPropagation(); go(-1); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" aria-label={U("الصورة التالية")}
            onClick={(e) => { e.stopPropagation(); go(1); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <p className="lightbox__count" aria-live="polite"><bdi>{index + 1} / {n}</bdi></p>
        </>
      )}
    </div>
  );
}
