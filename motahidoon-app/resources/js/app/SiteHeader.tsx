import { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import { useSite, useU } from "@/lib/site";
import type { Locale } from "@/types";

const LANG_NAME: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
};

/** مراسي الرئيسية تعمل داخل الصفحة، وتعود إليها من الصفحات الداخلية. */
function anchor(onHome: boolean, hash: string, home: string): string {
  return onHome ? `#${hash}` : `${home}#${hash}`;
}

export function SiteHeader({ active }: { active?: string }) {
  const { org, locale, locales } = useSite();
  const U = useU();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const onHome = active === "home";
  const home = locale === "ar" ? "/" : `/?lang=${locale}`;
  const keep = (path: string) => (locale === "ar" ? path : `${path}?lang=${locale}`);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: anchor(onHome, "about", home), label: U("من نحن") },
    { href: anchor(onHome, "partners", home), label: U("المؤسسات الشريكة") },
    { href: anchor(onHome, "fields", home), label: U("مجالات العمل") },
    { href: keep("/reports"), label: U("الإنجازات"), key: "report", inertia: true },
    { href: anchor(onHome, "support", home), label: U("الدعم والتواصل") },
  ];

  return (
    <header className="site-header">
      <div className="site-header__in">
        <Link className="brand" href={home}>
          <img src={`/${org.logoMark}`} alt="" />
          <span>
            <span className="brand__n">{org.shortName}</span>
            <span className="brand__s">{org.name}</span>
          </span>
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="nav"
          onClick={() => setOpen((v) => !v)}
        >
          {U("القائمة")}
        </button>

        <nav
          ref={navRef}
          className={open ? "nav is-open" : "nav"}
          id="nav"
          aria-label={U("التنقل الرئيسي")}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {links.map((l) =>
            l.inertia ? (
              <Link
                key={l.label}
                className="nav__a"
                href={l.href}
                aria-current={l.key === active ? "page" : undefined}
              >
                {l.label}
              </Link>
            ) : (
              <a key={l.label} className="nav__a" href={l.href}>
                {l.label}
              </a>
            ),
          )}

          <span className="langs" role="group" aria-label={U("اللغة")}>
            {locales.map((code) => (
              /* رابط عادي لا Inertia: تبديل اللغة يستحقّ تحميلاً كاملاً
                 حتى يُعيد الخادم رسم وسوم og: باللغة الجديدة. */
              <a
                key={code}
                className={code === locale ? "langs__a is-on" : "langs__a"}
                hrefLang={code}
                lang={code}
                href={`${window.location.pathname}?lang=${code}`}
                aria-current={code === locale ? "true" : undefined}
              >
                {LANG_NAME[code]}
              </a>
            ))}
          </span>
        </nav>
      </div>
    </header>
  );
}
