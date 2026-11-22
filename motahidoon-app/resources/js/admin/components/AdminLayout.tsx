import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState, type ReactNode } from "react";
import type { Role, SharedProps } from "../types";
import { Glyph, type GlyphName } from "./icons";
import { Flash, SectionContext } from "./ui";

/* هيكل اللوحة بهوية الموقع: قائمة جانبية بالحبري كشريط الموقع الداكن،
   يعلوها شريط ألوان الشعار، وفيها الشعار على بلاطة ورقية (كالتذييل وصفحة
   الدخول)، والصفحة الحالية على مربّع ليّن أخضر. المحتوى على الورق. على
   الجوال: شريط علوي وقائمة منزلقة تُغلق بالخلفية أو Esc. */

type NavItem = { href: string; label: string; icon: GlyphName; roles: Role[]; also?: string[] };

/* التسميات بلغة يفهمها المحرّر: «المحتوى الثابت» لما لا يتغيّر بالفترة
   (كان «المتن»)، و«التقارير الدورية» لما يُؤرَّخ بفترة (كان «الحاشية»). */
const NAV: { title: string; items: NavItem[] }[] = [
  { title: "", items: [{ href: "/admin", label: "الرئيسية", icon: "home", roles: ["admin", "editor", "translator"] }] },
  {
    title: "المحتوى الثابت",
    items: [
      { href: "/admin/settings", label: "بيانات التجمّع", icon: "settings", roles: ["admin", "editor"] },
      { href: "/admin/content-lines", label: "نصوص التعريف", icon: "lines", roles: ["admin", "editor"] },
      { href: "/admin/partners", label: "المؤسسات الشريكة", icon: "partners", roles: ["admin", "editor"] },
      { href: "/admin/pillars", label: "مجالات العمل", icon: "pillars", roles: ["admin", "editor"] },
      { href: "/admin/field-photos", label: "الصور الميدانية", icon: "photos", roles: ["admin", "editor"] },
      { href: "/admin/video-albums", label: "مكتبة الفيديو", icon: "video", roles: ["admin", "editor"], also: ["/admin/videos"] },
    ],
  },
  {
    title: "التقارير الدورية",
    // محرّر قسم التقرير (/admin/sections/…) تابع للتقارير
    items: [{ href: "/admin/reports", label: "التقارير الربعية", icon: "reports", roles: ["admin", "editor"], also: ["/admin/sections"] }],
  },
  {
    title: "اللغات والترجمة",
    items: [
      { href: "/admin/translations", label: "مراجعة الترجمات", icon: "translations", roles: ["admin", "editor", "translator"] },
      { href: "/admin/ui-strings", label: "ترجمة الأزرار والعناوين", icon: "strings", roles: ["admin", "editor", "translator"] },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { href: "/admin/media", label: "مكتبة الصور والملفات", icon: "media", roles: ["admin", "editor"] },
      { href: "/admin/users", label: "المستخدمون", icon: "users", roles: ["admin"] },
    ],
  },
];

/** شريط ألوان الشعار: أخضر ثم زيتوني ثم أحمر قصير — الأحمر خطّاً لا مساحة. */
function BrandStrip({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-1 ${className}`}>
      <span className="flex-3 bg-green" />
      <span className="flex-2 bg-olive" />
      <span className="flex-1 bg-red" />
    </div>
  );
}

const ROLE_LABEL: Record<Role, string> = { admin: "مدير", editor: "محرّر", translator: "مترجم" };
const MARK = "/assets/img/logos/mutahidoon-mark.png";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { auth, flash } = usePage<SharedProps>().props;
  const path = usePage().url.split("?")[0];
  const [open, setOpen] = useState(false);
  const role = auth?.role ?? "translator";

  const under = (href: string) => path === href || path.startsWith(`${href}/`);
  const isActive = (i: NavItem) => (i.href === "/admin" ? path === "/admin" : [i.href, ...(i.also ?? [])].some(under));

  const groups = NAV
    .map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);
  const section = groups.find((g) => g.items.some(isActive))?.title || "لوحة التحكم";

  // Esc يغلق القائمة المنزلقة على الجوال
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-rule/30 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      {open && <div aria-hidden="true" className="fixed inset-0 z-30 bg-ink/55 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        id="admin-nav"
        className={`${open ? "fixed inset-y-0 start-0 z-40 flex w-[17rem] shadow-[0_0_40px_rgba(26,26,26,.35)]" : "hidden"} flex-col bg-ink ink-scrollbar text-paper lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-screen lg:w-auto lg:shadow-none`}
      >
        <BrandStrip className="shrink-0" />
        <div className="flex items-center justify-between gap-3 border-b border-paper/10 px-5 py-5">
          <Link href="/admin" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-lg bg-paper p-1.5">
              <img src={MARK} alt="" className="size-8 object-contain" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[0.95rem] font-black">متحدون</span>
              <span className="mt-1 block text-xs text-paper/60">لوحة التحكم</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق القائمة" className="grid size-9 place-items-center rounded-lg border border-paper/15 text-paper/80 lg:hidden">
            <Glyph name="close" className="size-4" />
          </button>
        </div>

        <nav aria-label="أقسام اللوحة" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((g) => (
            <div key={g.title || "home"}>
              {g.title && (
                <p className="mb-2 flex items-center gap-2 px-3 text-[0.72rem] font-bold text-paper/55">
                  <span aria-hidden="true" className="h-0.5 w-3 bg-olive" />
                  {g.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {g.items.map((i) => {
                  const on = isActive(i);
                  return (
                    <li key={i.href}>
                      <Link
                        href={i.href}
                        onClick={() => setOpen(false)}
                        aria-current={on ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${on ? "bg-green font-bold text-paper" : "text-paper/75 hover:bg-paper/6 hover:text-paper"}`}
                      >
                        <Glyph name={i.icon} className={`size-[1.15rem] shrink-0 ${on ? "text-paper" : "text-paper/55"}`} />
                        {i.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-paper/10 p-4">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-olive text-sm font-black text-paper">
              {auth?.name?.trim().charAt(0) ?? "؟"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{auth?.name}</p>
              <p className="truncate text-xs text-paper/55">
                {ROLE_LABEL[role]}
                {auth?.email && <> · <span dir="ltr">{auth.email}</span></>}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-paper/15 text-xs font-bold text-paper/85 transition hover:border-paper/40 hover:text-paper">
              <Glyph name="site" className="size-4" />
              عرض الموقع
            </a>
            <button type="button" onClick={() => router.post("/admin/logout")} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-paper/15 text-xs font-bold text-paper/85 transition hover:border-red hover:text-paper">
              <Glyph name="logout" className="size-4" />
              خروج
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-ink px-4 pb-3.5 pt-3 text-paper lg:hidden">
          <BrandStrip className="absolute inset-x-0 bottom-0" />
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="rounded-md bg-paper p-1"><img src={MARK} alt="" className="size-6 object-contain" /></span>
            <span className="text-sm font-black">لوحة التحكم</span>
          </Link>
          <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="admin-nav" className="inline-flex h-9 items-center gap-2 rounded-lg border border-paper/20 px-3 text-xs font-bold">
            <Glyph name="menu" className="size-4" />
            القائمة
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
          <SectionContext.Provider value={section}>
            <Flash message={flash?.success ?? null} />
            {children}
          </SectionContext.Provider>
        </main>
      </div>
    </div>
  );
}
