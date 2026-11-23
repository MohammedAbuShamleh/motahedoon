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

/* أيقونات روابط القائمة — خطّية هندسية بلا دوائر (قرار الهوية). تظهر في
   درج الجوّال وحده؛ قائمة الشاشات الواسعة نصّ كما كانت. */
const NAV_ICONS: Record<string, React.ReactNode> = {
  about: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 10.5V16M12 7.5v.5" />,
  partners: <path d="M3.5 4.5h7v7h-7zM13.5 4.5h7v7h-7zM3.5 13.5h7v7h-7zM13.5 13.5h7v7h-7z" />,
  fields: <path d="M12 3l9 9-9 9-9-9zM12 8.5l3.5 3.5-3.5 3.5L8.5 12z" />,
  report: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 17v-3M12 17v-6M15 17v-4" />,
  support: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
};

function NavIcon({ id }: { id: string }) {
  return (
    <svg className="nav__ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{NAV_ICONS[id]}</svg>
  );
}

export function SiteHeader({ active }: { active?: string }) {
  const { org, locale, locales } = useSite();
  const U = useU();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const onHome = active === "home";
  const home = locale === "ar" ? "/" : `/?lang=${locale}`;
  const keep = (path: string) => (locale === "ar" ? path : `${path}?lang=${locale}`);

  /* الدرج مفتوحاً: Esc يغلقه، والصفحة خلفه لا تتمرّر، والتركيز ينتقل إلى
     زرّ الإغلاق — ويعود إلى زرّ القائمة عند الإغلاق */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      root.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      toggleRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  /* الشاشة اتّسعت (تدوير الجهاز): الدرج لا معنى له، فيُغلق */
  useEffect(() => {
    const mq = matchMedia("(min-width: 1201px)");
    const onChange = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const links = [
    { id: "about", href: anchor(onHome, "about", home), label: U("من نحن") },
    { id: "partners", href: anchor(onHome, "partners", home), label: U("المؤسسات الشريكة") },
    { id: "fields", href: anchor(onHome, "fields", home), label: U("مجالات العمل") },
    { id: "report", href: keep("/reports"), label: U("الإنجازات"), key: "report", inertia: true },
    { id: "support", href: anchor(onHome, "support", home), label: U("الدعم والتواصل") },
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
          ref={toggleRef}
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="nav"
          aria-label={U("القائمة")}
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
          <span className="nav-toggle__t">{U("القائمة")}</span>
        </button>

        {/* خلفية الدرج: تعتيم الصفحة، والنقر عليها يغلقه */}
        <div className={open ? "nav-backdrop is-open" : "nav-backdrop"} aria-hidden="true" onClick={() => setOpen(false)} />

        <nav
          ref={navRef}
          className={open ? "nav is-open" : "nav"}
          id="nav"
          aria-label={U("التنقل الرئيسي")}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {/* رأس الدرج (الجوّال وحده): الشعار وزرّ الإغلاق */}
          <div className="nav__head">
            <span className="nav__brand">
              <img src={`/${org.logoMark}`} alt="" />
              <span>{org.shortName}</span>
            </span>
            <button ref={closeRef} type="button" className="nav__close" aria-label={U("إغلاق")} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>

          {links.map((l) =>
            l.inertia ? (
              <Link
                key={l.label}
                className="nav__a"
                href={l.href}
                aria-current={l.key === active ? "page" : undefined}
              >
                <NavIcon id={l.id} />
                <span>{l.label}</span>
              </Link>
            ) : (
              <a key={l.label} className="nav__a" href={l.href}>
                <NavIcon id={l.id} />
                <span>{l.label}</span>
              </a>
            ),
          )}
        </nav>

        <LangSwitch locale={locale} locales={locales} label={U("اللغة")} />
      </div>
    </header>
  );
}
