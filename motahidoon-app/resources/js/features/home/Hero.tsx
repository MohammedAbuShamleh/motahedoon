import { useRef } from "react";
import { useHeroSlider } from "@/hooks/useHeroSlider";
import { useSite, useU } from "@/lib/site";
import type { Pillar } from "@/types";

/**
 * الشعار النصّي بتسلسل بصري من ثلاث درجات — عرضٌ وحده، النصّ نفسه:
 *   «في قلب الحصار ..»   وسم صغير على علامة قلم
 *   «تحوّل الدعمُ إلى»   سطر متوسّط
 *   «ثبات»              الكلمة الكبرى بالأحمر
 * المسافات بين القطع محفوظة فيبقى textContent حرفياً كما هو (بصمة
 * tools/verify-strings.js). الكلمة الكبرى في الشعار العربي وحده؛ في
 * اللغات الأخرى لا تُحقن — والنصّ بلا «..» يُعرض سطراً واحداً.
 */
/* «ثبات» ممدودةً بالتطويل بين الباء والألف — الموضع الوحيد الذي يقبل
   الوصل فيها (الألف لا تتّصل بما بعدها) */
const STRETCHED = "ثبـــات";

function Tagline({ text }: { text: string }) {
  const cut = text.indexOf(".. ");
  const kicker = cut < 0 ? null : text.slice(0, cut + 2);
  const rest = cut < 0 ? text : text.slice(cut + 3);
  const at = rest.indexOf("ثبات");
  const lead = at < 0 ? rest : rest.slice(0, at);
  const tail = at < 0 ? "" : rest.slice(at + "ثبات".length);

  return (
    <>
      {kicker !== null && (
        <>
          <span className="hero__kicker"><span className="hero__mark">{kicker}</span></span>{" "}
        </>
      )}
      <span className="hero__lead">{lead}</span>
      {at >= 0 && (
        /* المدّ (الكشيدة) رسمٌ لا نصّ: يُرسم من data-k في ::before ويُستر
           عن قارئ الشاشة، ويبقى «ثبات» نفسه في textContent للبصمة وللقراءة */
        <em className="hero__word" data-k={STRETCHED}>
          <span className="hero__wordtxt">ثبات</span>
        </em>
      )}
      {tail && <span className="hero__lead">{tail}</span>}
    </>
  );
}

/** مدّة الشريحة — يقرؤها المنزلق للعدّ وCSS لملء شريط التقدّم (--dwell). */
const DWELL = 7000;

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
            <p className="hero__st">{p.short}</p>
            {p.cover!.caption && <p className="hero__sc">{p.cover!.caption}</p>}
          </>
        ),
      })),
  ];

  const { at, go, take } = useHeroSlider(ref, slides.length, DWELL);

  return (
    <section
      className="hero"
      ref={ref}
      style={{ "--dwell": `${DWELL}ms` } as React.CSSProperties}
      {...(slides.length > 1 ? { "data-slider": "" } : {})}
    >
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
        <h1 className="hero__h"><Tagline text={org.tagline} /></h1>
        <p className="hero__sub">{org.name}</p>
      </div>

      {/* شريط الشريحة: عنوانها ومؤشّرات التقدّم، أسفل الوسط بلا أرضية */}
      <div className="hero__strip">
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
              >
                {/* المفتاح at: الشريط يبدأ من الصفر مع كل شريحة */}
                {i === at && <span key={at} className="hero__bar" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
