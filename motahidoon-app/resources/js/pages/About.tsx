import { Link } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { Band, Fact, Filled, Mark, Slot, Statement } from "@/components/primitives";
import { Nums } from "@/lib/nums";
import { COUNTS, useCount, useSite, useU } from "@/lib/site";
import type { Entry, Founding, Identity } from "@/types";

interface Props {
  identity: Identity;
  founding: Founding;
  governance: string | null;
  intro: string[];
  goals: string[];
  aspirations: string[];
  partnerCount: number;
  pillarCount: number;
}

export default function About({
  identity: V, founding: F, governance, intro, goals, aspirations,
  partnerCount, pillarCount,
}: Props) {
  const U = useU();
  const C = useCount();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);

  return (
    <Layout>
      <Band
        cls="ph"
        noReveal
        main={
          <>
            <p className="ph__kicker">{U("التعريف الكامل")}</p>
            <h1 className="h-page">{U("من نحن")}</h1>
            <div className="prose body-lg" style={{ marginTop: "clamp(1.75rem,3.5vw,2.5rem)" }}>
              {intro.map((x, i) => <p key={`i${i}`}>{x}</p>)}
              {F.story.map((x, i) => <p key={`s${i}`}><Nums text={x} /></p>)}
            </div>
          </>
        }
        aside={
          <>
            {F.year
              ? <div className="facts"><Fact value={F.year} label={U("سنة التأسيس")} /></div>
              : <Slot label={U("سنة التأسيس")} />}
            <div className="facts" style={{ marginTop: "1.5rem" }}>
              <Fact value={String(partnerCount)} label={C(partnerCount, COUNTS.partners)} />
              <Fact value={String(pillarCount)} label={C(pillarCount, COUNTS.pillars)} />
            </div>
          </>
        }
      />

      <Band
        main={
          <>
            <Statement label={U("الرؤية")} value={V.vision} />
            <Statement label={U("الرسالة")} value={V.mission} />
            {V.values?.length ? (
              <>
                <h2 className="h-sub sub-head">{U("القيم الأساسية")}</h2>
                <ul className="entries">
                  {V.values.map((v, i) => {
                    const e: Entry = typeof v === "string" ? { text: v } : v;
                    return (
                      <li className={e.term ? "entry" : "entry entry--plain"} key={i}>
                        {e.term ? <p className="entry__term">{e.term}</p> : null}
                        <p className="entry__text"><Nums text={e.text} /></p>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="sub-head"><Slot label={U("القيم")} /></div>
            )}
          </>
        }
        aside={
          <>
            <Mark label={U("الهوية")} />
            <div style={{ marginTop: "1rem" }}>
              {governance
                ? <Filled label={U("الحوكمة واتخاذ القرار")} value={governance} />
                : <Slot label={U("الحوكمة واتخاذ القرار")} />}
            </div>
          </>
        }
      />

      {(goals.length > 0 || aspirations.length > 0) && (
        <Band
          main={
            <>
              {goals.length > 0 && (
                <>
                  <h2 className="h-sec">{U("الأهداف")}</h2>
                  <ul className="bullets bullets--two">
                    {goals.map((g, i) => <li key={i}><Nums text={g} /></li>)}
                  </ul>
                </>
              )}
              {aspirations.length > 0 && (
                <>
                  <h2 className="h-sec sub-head">{U("التطلعات الاستراتيجية")}</h2>
                  <ul className="bullets">
                    {aspirations.map((g, i) => <li key={i}><Nums text={g} /></li>)}
                  </ul>
                </>
              )}
            </>
          }
          aside={<Mark label={U("إلى أين")} />}
        />
      )}

      <section className="band pnav">
        <div className="sheet">
          <div className="sheet__main">
            <div className="pnav__grid">
              <Link className="pnav__card" href={`${path("/")}#partners`}>
                <span className="pnav__k">{U("المؤسسات الشريكة")}</span>
                <span className="pnav__t">{partnerCount} {U("مؤسسة تحت المظلة")}</span>
              </Link>
              <Link className="pnav__card" href={`${path("/")}#fields`}>
                <span className="pnav__k">{U("مجالات العمل")}</span>
                <span className="pnav__t">{pillarCount} {U("مجالات دائمة")}</span>
              </Link>
            </div>
            <p style={{ marginTop: "1.5rem" }}>
              <Link className="btn btn--ghost" href={path("/")}>
                {U("العودة إلى الرئيسية")}
              </Link>
            </p>
          </div>
          <aside className="sheet__aside" />
        </div>
      </section>
    </Layout>
  );
}
