import { useRef } from "react";
import { useHeroScrim } from "@/hooks/useHeroScrim";
import { useHeroSlider } from "@/hooks/useHeroSlider";
import { useSite, useU } from "@/lib/site";
import type { Pillar } from "@/types";

/**
 * الشعار النصّي بتسلسل بصري من ثلاث درجات — عرضٌ وحده، النصّ نفسه:
 *   «في قلب الحصار ..»   وسم صغير على علامة قلم
 *   «تحوّل الدعمُ إلى»   سطر متوسّط
 *   «ثبات»              الكلمة الكبرى بالأحمر
 * والترتيب نفسه في كلّ لغة (بطلب صاحب المشروع). المسافات بين القطع
 * محفوظة فيبقى textContent حرفياً كما هو (بصمة tools/verify-strings.js).
 */

/* تقسيم الشعار في كلّ لغة — قاعدة عرض لا نصّ: أين ينتهي الوسم الصغير
   (cut)، وأيّ كلمة هي الكبرى (word). إن تغيّرت الترجمة فلم يُعثر على
   أحدهما عُرض الباقي بلا تقسيم — لا يُخترع نصّ ولا يُحذف. */
const SPLIT: Record<string, { cut: string; word: string }> = {
  ar: { cut: "..", word: "ثبات" },
  en: { cut: ",", word: "steadfastness" },
  tr: { cut: "kalbinde", word: "sebata" },
};

/* «ثبات» ممدودةً بالتطويل بين الباء والألف — الموضع الوحيد الذي يقبل
   الوصل فيها (الألف لا تتّصل بما بعدها) */
const STRETCHED = "ثبـــات";

function Tagline({ text, locale }: { text: string; locale: string }) {
  const rule = SPLIT[locale];
  const c = rule ? text.indexOf(rule.cut) : -1;
  const end = rule && c >= 0 ? c + rule.cut.length : 0;
  const kicker = c < 0 ? null : text.slice(0, end);
  const gap = c < 0 ? "" : (/^\s*/.exec(text.slice(end))?.[0] ?? "");
  const rest = c < 0 ? text : text.slice(end + gap.length);
  const word = rule?.word ?? "";
  const at = word ? rest.indexOf(word) : -1;
  const lead = at < 0 ? rest : rest.slice(0, at);
  const tail = at < 0 ? "" : rest.slice(at + word.length);

  return (
    <>
      {kicker !== null && (
        <>
          <span className="hero__kicker"><span className="hero__mark">{kicker}</span></span>{gap}
        </>
      )}
      {lead && <span className="hero__lead">{lead}</span>}
      {at >= 0 && (locale === "ar" ? (
        /* المدّ (الكشيدة) رسمٌ لا نصّ: يُرسم من data-k في ::before ويُستر
           عن قارئ الشاشة، ويبقى «ثبات» نفسه في textContent للبصمة وللقراءة */
        <em className="hero__word" data-k={STRETCHED}>
          <span className="hero__wordtxt">{word}</span>
        </em>
      ) : (
        /* بلا كشيدة في اللاتينية؛ --len يقود المقاس فلا تفيض الكلمة الطويلة */
        <em className="hero__word hero__word--plain" style={{ "--len": word.length } as React.CSSProperties}>
          {word}
        </em>
      ))}
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
  const { org, locale } = useSite();
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
  useHeroScrim(ref, slides.length);   // ستارة مقيسة لكلّ شريحة

  return (
    <section
      className="hero"
      data-stat="hero"
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
        <h1 className="hero__h"><Tagline text={org.tagline} locale={locale} /></h1>
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
