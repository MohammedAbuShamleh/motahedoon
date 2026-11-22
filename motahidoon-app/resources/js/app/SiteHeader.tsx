import { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import { useSite, useU } from "@/lib/site";
import type { Locale } from "@/types";

const LANG_NAME: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
};

/**
 * زرّ اللغة — منفصل عن القائمة الرئيسية.
 * يعرض اللغة الحالية وحدها؛ والمرور بالفأرة (CSS) أو النقر أو لوحة
 * المفاتيح يكشف اللغات الأخرى في لوح صغير مستقلّ.
 */
function LangSwitch({
  locale,
  locales,
  label,
}: {
  locale: Locale;
  locales: readonly Locale[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const others = locales.filter((code) => code !== locale);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={open ? "lang is-open" : "lang"}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        // يُغلق حين يغادر التركيز الزرّ ولوحه معاً، لا عند التنقّل بينهما
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        className="lang__btn"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="lang-menu"
        aria-label={`${label}: ${LANG_NAME[locale]}`}
        onClick={() => setOpen((v) => !v)}
      >
        {/* رمز هندسي بلا دوائر: مربّع ليّن بخطّ استواء ومعيّنِ خطّ طول — هندسة معيّن الشعار */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <path d="M3 12h18M12 3l4 9-4 9-4-9z" />
        </svg>
        <span className="lang__name" lang={locale}>{LANG_NAME[locale]}</span>
        <svg className="lang__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="lang__menu" id="lang-menu">
        <ul className="lang__list" aria-label={label}>
          {others.map((code) => (
            <li key={code}>
              {/* رابط عادي لا Inertia: تبديل اللغة يستحقّ تحميلاً كاملاً
                  حتى يُعيد الخادم رسم وسوم og: باللغة الجديدة. */}
              <a
                className="lang__a"
                hrefLang={code}
                lang={code}
                href={`${window.location.pathname}?lang=${code}`}
              >
                {LANG_NAME[code]}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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
      <div className="site-header__in panel">
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
        </nav>

        <LangSwitch locale={locale} locales={locales} label={U("اللغة")} />
      </div>
    </header>
  );
}
