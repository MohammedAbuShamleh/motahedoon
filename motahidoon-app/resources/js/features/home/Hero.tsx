import { useRef } from "react";
import { useHeroSlider } from "@/hooks/useHeroSlider";
import { useSite, useU } from "@/lib/site";
import type { Pillar } from "@/types";

/* الكلمة المميّزة بالأحمر موجودة في الشعار العربي وحده. في اللغات
   الأخرى لا تُحقن — نقل حرفي لسلوك app.js الثابت. */
function Tagline({ text }: { text: string }) {
  const parts = text.split("ثبات");
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <em>ثبات</em>
      {parts.slice(1).join("ثبات")}
    </>
  );
}

interface Slide {
  src: string;
  alt: string;
  label: string;
  pane: React.ReactNode;
}

export function Hero({
  pillars,
  partnerCount,
}: {
  pillars: Pillar[];
  partnerCount: number;
}) {
  const { org } = useSite();
  const U = useU();
  const ref = useRef<HTMLElement>(null);

  /* الشريحة الأولى صورة التجمّع ونصّها الثابت، ثم شريحة لكل مجال **له
     غلاف**. العدد مشتقّ لا مفترَض: مجال بلا غلاف لا شريحة له. */
  const slides: Slide[] = [
    {
      src: "assets/img/photos/field-05.jpg",
      alt: U("من التوثيق الميداني للتجمع"),
      label: U("الافتتاحية"),
      pane: (
        <ul className="hero__facts">
          <li><b>{partnerCount}</b><span>{U("مؤسسات شريكة")}</span></li>
          <li><b>{pillars.length}</b><span>{U("مجالات عمل")}</span></li>
        </ul>
      ),
    },
    ...pillars
      .filter((p) => p.cover?.src)
      .map((p) => ({
        src: p.cover!.src,
        alt: p.cover!.caption || U("من التوثيق الميداني للتجمع"),
        label: p.short,
        pane: (
          <>
            <p className="hero__num">{p.num}</p>
            <p className="hero__st">{p.short}</p>
            {p.cover!.caption && <p className="hero__sc">{p.cover!.caption}</p>}
          </>
        ),
      })),
  ];

  const { at, go, take } = useHeroSlider(ref, slides.length);

  return (
    <section className="hero" ref={ref} {...(slides.length > 1 ? { "data-slider": "" } : {})}>
      <div className="hero__shot">
        {slides.map((s, i) => (
          <div
            key={s.src}
            className={i === 0 ? "hero__layer is-on" : "hero__layer"}
            style={i === 0 ? { zIndex: 1 } : undefined}
          >
            <img
              {...(i === 0
                ? { src: `/${s.src}`, fetchPriority: "high" as const }
                : { "data-src": `/${s.src}` })}
              alt={s.alt}
              decoding="async"
            />
          </div>
        ))}
      </div>

      <div className="hero__card">
        <p className="hero__eyebrow">{org.name}</p>
        <h1 className="hero__h"><Tagline text={org.tagline} /></h1>

        <div className="hero__slot">
          {slides.map((s, i) => (
            <div
              key={s.src}
              className={i === at ? "hero__pane is-on" : "hero__pane"}
              aria-hidden={i !== at}
            >
              {s.pane}
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="hero__dots" role="group" aria-label={U("شرائح الافتتاحية")}>
            {slides.map((s, i) => (
              <button
                key={s.src}
                className="hero__dot"
                type="button"
                aria-current={i === at ? "true" : undefined}
                aria-label={s.label}
                onClick={() => { take(); go(i); }}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                  e.preventDefault();
                  const ltr = document.documentElement.dir !== "rtl";
                  take();
                  go(at + ((e.key === "ArrowRight") === ltr ? 1 : -1));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
