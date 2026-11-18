import type { ReactNode } from "react";
import { useSite, useU } from "@/lib/site";
import {
  useBannerOffset,
  useDocumentLocale,
  useScrolled,
} from "@/hooks/useDocumentChrome";
import { useSmoothWheel } from "@/hooks/useSmoothWheel";
import { useGlassSheen } from "@/hooks/useGlassSheen";
import { useFilmstrip, useReveal, useStagger } from "@/hooks/useReveal";
import { usePage } from "@inertiajs/react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function Layout({
  children,
  active,
}: {
  children: ReactNode;
  active?: string;
}) {
  const { locale, unapproved } = useSite();
  const U = useU();
  /* مفتاح التنقّل: Inertia يستبدل المحتوى بلا إعادة تحميل، فالخطّافات
     التي تمسك عقد DOM تحتاج إعادة تشغيل عند كل صفحة. */
  const key = usePage().url;

  useDocumentLocale(locale);
  useScrolled();
  useBannerOffset(Boolean(unapproved));
  useSmoothWheel();
  useGlassSheen();
  useReveal(key);
  useStagger(key);
  useFilmstrip(key);

  return (
    <>
      <a className="skip" href="#main">{U("تخطَّ إلى المحتوى")}</a>

      {/* التنويه مثبّت أعلى الكل؛ ارتفاعه يُقاس في --xb فينزاح ما تحته */}
      {unapproved && <p className="xbanner" role="note">{unapproved}</p>}

      <SiteHeader active={active} />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
