import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useU } from "@/lib/site";
import { Fact, SectionHead } from "@/components/primitives";
import { SpotArrows, SpotCount } from "@/components/spot";
import { useSpotlight } from "@/hooks/useSpotlight";

/* ---------- من الميدان: عارض صورة واحدة مع شبكة مصغّرات ----------
   بلغة عارض «الشهادات» في المواقع المؤسسية (بطلب صاحب المشروع 2026-11-19):
   صورة كبيرة في إطار مائل فوق لوح بصبغة خضراء يميل مع كلّ تبديل؛ الجديدة
   تنكشف فوق السابقة من جهة الحركة وتستقرّ من تقريب طفيف. بجانبها العدّاد
   والسهمان وشبكة مصغّرات مربّعة — المضاءة بإطار أخضر وشريط يمتلئ بمدّة
   المكث، وعند امتلائه تتقدّم الصورة (useSpotlight). لا تعليق لكلّ صورة —
   لا يُخترع وصف ولا يُذكر موقع (قاعدة المحتوى). الصور أبيض وأسود في الملف:
   لا مرشّح فوقها. النقر على الصورة يفتح العارض بملء الشاشة عليها، والإغلاق
   يُبقي العارض على آخر صورة تصفّحها الزائر هناك. */
const GALLERY_DWELL = 5000;

export function FieldGallery({ photos }: { photos: string[] }) {
  const U = useU();
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const s = useSpotlight(photos.length);
  if (!photos.length) return null;

  const n = photos.length;
  const alt = U("من التوثيق الميداني للتجمع");
  /* العارض بملء الشاشة فوقه: لا يتقدّم خلفه */
  const playing = s.playing && open === null;

  return (
    <section className="band band--tight fgal" id="field">
      <div className="sec__in">
        <SectionHead
          title={U("من الميدان")}
          side={<Fact value={String(n)} label={U("صور معتمدة")} />}
        />
      </div>

      <div
        className="spot gspot reveal"
        {...s.bind}
        data-dir={s.dir}
        style={{ "--dwell": `${GALLERY_DWELL}ms`, "--tilt": s.index % 2 ? "2deg" : "-2deg" } as CSSProperties}
        role="region"
        aria-roledescription="carousel"
        aria-label={U("من الميدان")}
      >
        <div className="gspot__media">
          <button
            type="button"
            className="spot__frame gspot__frame"
            aria-label={`${U("عرض الصورة")} ${s.index + 1}`}
            onClick={(e) => { opener.current = e.currentTarget; setOpen(s.index); }}
          >
            {photos.map((src, i) => (
              <span key={src} className={`spot__img ${s.state(i)}`} aria-hidden={i !== s.index}>
                <img src={`/${src}`} alt={i === s.index ? alt : ""}
                  loading={i < 2 ? "eager" : "lazy"} decoding="async" />
              </span>
            ))}
          </button>
        </div>

        <div className="gspot__side">
          <SpotCount index={s.index} total={n} />
          <p className="gspot__cap">{alt}</p>
          <SpotArrows onBack={s.back} onNext={s.next}
            backLabel={U("الصورة السابقة")} nextLabel={U("الصورة التالية")} />
          <div className="spot__thumbs gspot__thumbs stagger">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                className={i === s.index ? "spot__thumb is-on" : "spot__thumb"}
                aria-label={`${U("عرض الصورة")} ${i + 1}`}
                aria-current={i === s.index ? "true" : undefined}
                onClick={() => s.go(i)}
              >
                <img src={`/${src}`} alt="" loading="lazy" decoding="async" />
                {/* شريط المكث داخل المصغّرة المضاءة — امتلاؤه يقدّم العارض */}
                {i === s.index && (
                  <i className="spot__fill" onAnimationEnd={s.next}
                     style={{ animationPlayState: playing ? "running" : "paused" } as CSSProperties} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {open !== null && (
        <Lightbox
          photos={photos}
          index={open}
          alt={alt}
          onIndex={setOpen}
          onClose={() => { s.go(open); setOpen(null); opener.current?.focus(); }}
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
