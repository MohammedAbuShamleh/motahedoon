import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { COUNTS, useCount, useU } from "@/lib/site";
import { Fact, SectionHead } from "@/components/primitives";
import { useSpotlight } from "@/hooks/useSpotlight";

/* ---------- من الميدان: مسرح وشريط ----------
   (بطلب صاحب المشروع 2026-11-21)
   في جهة: الصورة الكبرى — أكبر ما في القسم — كاملةً بنسبتها على الورق (لا
   قصّ)، تتبدّل وحدها بمدّة مكث يملؤها شريط تقدّم، وتتوقّف تحت المؤشّر.
   في الجهة الأخرى: شريط متحرّك من بطاقات حبرية صغيرة، لكلّ صورة بطاقة
   برقمها، تتّصل البطاقات بسلسلة واحدة (خطّ وعُقد مربّعة). الشريط يجري بلا
   توقّف ويقف تحت المؤشّر؛ والنقر على بطاقة يجعل صورتها الكبرى، والبطاقة
   الحالية مُضاءة. على الجوّال: الكبرى أعلى والشريط أفقي تحتها.
   النقر على الكبرى يفتحها بملء الشاشة: تكبر من مكانها وتعود إليه (FLIP).
   لا تعليق لكلّ صورة — لا يُخترع وصف ولا يُذكر موقع (قاعدة المحتوى).
   الصور أبيض وأسود في الملف. مع «تقليل الحركة» يقف كلّ شيء ويُمرَّر باليد. */
const DWELL = 5500;
const EASE = "cubic-bezier(.2, .75, .25, 1)";
const DUR = 520;

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n: number) => String(n).padStart(2, "0");

/** المستطيل المرئي فعلاً لصورة محتواة (object-fit: contain) داخل صندوقها. */
function visibleRect(img: HTMLImageElement): DOMRect {
  const r = img.getBoundingClientRect();
  const iw = img.naturalWidth, ih = img.naturalHeight;
  if (!iw || !ih) return r;
  const s = Math.min(r.width / iw, r.height / ih);
  const w = iw * s, h = ih * s;
  return new DOMRect(r.left + (r.width - w) / 2, r.top + (r.height - h) / 2, w, h);
}

export function FieldGallery({ photos }: { photos: string[] }) {
  const U = useU();
  const C = useCount();
  const [open, setOpen] = useState<number | null>(null);
  const s = useSpotlight(photos.length);
  const opener = useRef<HTMLButtonElement | null>(null);
  /* صورة المسرح — منها تبدأ حركة الفتح وإليها تعود */
  const stageImg = useRef<HTMLImageElement | null>(null);
  const cur = useRef(0);
  cur.current = s.index;
  const origin = useCallback((i: number) => (i === cur.current ? stageImg.current : null), []);

  if (!photos.length) return null;

  const n = photos.length;
  const alt = U("من التوثيق الميداني للتجمع");
  /* العارض بملء الشاشة فوقه: لا يتقدّم خلفه */
  const playing = s.playing && open === null;
  /* الشريط نسختان متتاليتان فيدور بلا فاصل؛ الثانية للعين وحدها */
  const loop = [...photos.map((src, i) => ({ src, i, copy: false })),
                ...photos.map((src, i) => ({ src, i, copy: true }))];

  return (
    <section className="band fgal" id="field">
      <div className="sec__in">
        <SectionHead
          title={U("من الميدان")}
          side={<Fact value={String(n)} label={C(n, COUNTS.photos)} />}
        />

        <div
          className="fstage reveal"
          {...s.bind}
          style={{ "--dwell": `${DWELL}ms`, "--n": n } as CSSProperties}
          role="region"
          aria-roledescription="carousel"
          aria-label={U("من الميدان")}
        >
          {/* الصورة الكبرى */}
          <div className="fstage__main">
            <button
              type="button"
              className="fstage__frame"
              aria-label={`${U("عرض الصورة")} ${s.index + 1}`}
              onClick={(e) => { opener.current = e.currentTarget; setOpen(s.index); }}
            >
              <img
                key={photos[s.index]}
                ref={stageImg}
                className="fstage__img"
                src={`/${photos[s.index]}`}
                alt={alt}
                loading="lazy"
                decoding="async"
              />
              <span className="fstage__zoom" aria-hidden="true"><ExpandIcon /></span>
            </button>
            <div className="fstage__meta" aria-hidden="true">
              <span className="fstage__count"><b key={s.index}>{pad(s.index + 1)}</b> / {pad(n)}</span>
              {/* شريط المكث: امتلاؤه يقدّم الصورة الكبرى */}
              <span className="fstage__bar">
                <i key={s.index} className="fstage__fill" onAnimationEnd={s.next}
                   style={{ animationPlayState: playing ? "running" : "paused" }} />
              </span>
            </div>
          </div>

          {/* الشريط المتحرّك: بطاقات حبرية متّصلة */}
          <div className="fstrip">
            <ul className={playing ? "fstrip__track" : "fstrip__track is-held"}>
              {loop.map(({ src, i, copy }) => (
                <li key={`${src}-${copy ? "b" : "a"}`} className="fstrip__item" aria-hidden={copy || undefined}>
                  <button
                    type="button"
                    className={i === s.index ? "fstrip__card is-on" : "fstrip__card"}
                    aria-label={`${U("عرض الصورة")} ${i + 1}`}
                    aria-current={!copy && i === s.index ? "true" : undefined}
                    tabIndex={copy ? -1 : undefined}
                    onClick={() => s.go(i)}
                  >
                    <span className="fstrip__media">
                      <img src={`/${src}`} alt="" loading="lazy" decoding="async" />
                    </span>
                    <span className="fstrip__no">{pad(i + 1)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {open !== null && (
        <Lightbox
          photos={photos}
          index={open}
          alt={alt}
          origin={origin}
          onIndex={(i) => { setOpen(i); s.go(i); }}
          onClose={() => { setOpen(null); opener.current?.focus(); }}
        />
      )}
    </section>
  );
}

/** أربع زوايا تتّسع — تكبير بلا عدسة دائرية (لا دوائر في الهوية). */
function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}

/** حركة بين مستطيل الخانة وموضع الصورة في العارض. reverse: من العارض إلى الخانة. */
function flip(el: HTMLImageElement, from: DOMRect, reverse = false): Animation {
  const to = el.getBoundingClientRect();
  const t = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  const frames: Keyframe[] = [{ transform: t }, { transform: "none" }];
  return el.animate(reverse ? frames.reverse() : frames, { duration: DUR, easing: EASE, fill: "both" });
}

const BACKDROP: Keyframe[] = [
  { backgroundColor: "rgba(26,26,26,0)" },
  { backgroundColor: "rgba(26,26,26,.95)" },
];

/** عارض بملء الشاشة: السابق والتالي، والأسهم وEsc، وقفل تمرير الصفحة.
    يفتح بتكبير الصورة من خانتها ويُغلق بتصغيرها إليها. */
function Lightbox({ photos, index, alt, origin, onIndex, onClose }: {
  photos: string[];
  index: number;
  alt: string;
  origin: (i: number) => HTMLImageElement | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const U = useU();
  const closeRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const opened = useRef(false);
  const closing = useRef(false);
  const [phase, setPhase] = useState<"in" | "on" | "out">("in");
  const n = photos.length;
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);

  /* خانة الصورة الحالية تُخفى ما دامت صورتها «طائرة» في العارض */
  useEffect(() => {
    const el = origin(index);
    if (el) el.style.visibility = "hidden";
    return () => { if (el) el.style.visibility = ""; };
  }, [index, origin]);

  /* أول تحميل: تكبير من الخانة. وما بعده (السابق/التالي): ظهور هادئ في مكانها */
  const onShown = useCallback(() => {
    const el = imgRef.current;
    /* مرّة واحدة لكلّ صورة: المخبّأة قد يصلها onLoad والفحص كلاهما */
    if (!el || el.dataset.shown) return;
    el.dataset.shown = "1";
    el.style.opacity = "1";
    if (opened.current) {
      if (!still()) el.animate([{ opacity: 0, transform: "scale(.985)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: EASE });
      return;
    }
    opened.current = true;
    setPhase("on");
    if (still()) return;
    boxRef.current?.animate(BACKDROP, { duration: DUR - 100, easing: "ease", fill: "both" });
    const tile = origin(index);
    if (tile) flip(el, visibleRect(tile));
    else el.animate([{ opacity: 0, transform: "scale(.92)" }, { opacity: 1, transform: "none" }], { duration: DUR, easing: EASE });
  }, [index, origin]);

  /* الصورة المخبّأة قد تكون محمّلة قبل ربط onLoad */
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) onShown();
  }, [onShown]);

  /* الإغلاق: تصغر الصورة عائدةً إلى خانتها وتنحسر الخلفية، ثم يُفكّ العارض */
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = imgRef.current;
    if (still() || !el || !opened.current) { onClose(); return; }
    setPhase("out");
    const runs: Animation[] = [];
    const box = boxRef.current;
    if (box) runs.push(box.animate([...BACKDROP].reverse(), { duration: DUR - 60, easing: "ease", fill: "both" }));
    el.getAnimations().forEach((a) => a.cancel());
    const tile = origin(index);
    runs.push(tile
      ? flip(el, visibleRect(tile), true)
      : el.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.92)" }], { duration: 300, easing: EASE, fill: "both" }));
    Promise.all(runs.map((a) => a.finished)).then(onClose, onClose);
  }, [index, origin, onClose]);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    const root = document.documentElement;
    const prevGutter = root.style.scrollbarGutter;
    /* قفل التمرير يُخفي شريطه فتنزاح الصفحة؛ حجز مكانه يُبقي الخانات حيث
       هي فتعود الصورة إلى موضعها بالضبط */
    root.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // الاتجاه بصري: في RTL السهم الأيسر يتقدّم
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      root.style.scrollbarGutter = prevGutter;
      document.removeEventListener("keydown", onKey);
    };
  }, [go, close]);

  return (
    <div ref={boxRef} className={`lightbox is-${phase}`} role="dialog" aria-modal="true"
         aria-label={U("من الميدان")} onClick={close}>
      <figure className="lightbox__fig" onClick={(e) => e.stopPropagation()}>
        <img ref={imgRef} key={photos[index]} src={`/${photos[index]}`} alt={alt}
             style={{ opacity: 0 }} onLoad={onShown} onError={onShown} />
      </figure>

      <button ref={closeRef} type="button" className="lightbox__close" aria-label={U("إغلاق")} onClick={close}>
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
