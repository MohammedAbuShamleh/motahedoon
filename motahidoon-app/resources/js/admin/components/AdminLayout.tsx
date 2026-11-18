import { Link, router, usePage } from "@inertiajs/react";
import { useState, type ReactNode } from "react";
import type { Role, SharedProps } from "../types";
import { Flash } from "./ui";

type NavItem = { href: string; label: string; roles: Role[] };

const NAV: { title: string; items: NavItem[] }[] = [
  { title: "", items: [{ href: "/admin", label: "البداية", roles: ["admin", "editor", "translator"] }] },
  {
    title: "المتن — دائم",
    items: [
      { href: "/admin/settings", label: "الهوية والإعدادات", roles: ["admin", "editor"] },
      { href: "/admin/content-lines", label: "القيم والأهداف والسرد", roles: ["admin", "editor"] },
      { href: "/admin/partners", label: "المؤسسات الشريكة", roles: ["admin", "editor"] },
      { href: "/admin/pillars", label: "مجالات العمل", roles: ["admin", "editor"] },
      { href: "/admin/field-photos", label: "صور الميدان", roles: ["admin", "editor"] },
    ],
  },
  {
    title: "الحاشية — مؤرَّخة",
    items: [{ href: "/admin/reports", label: "التقارير الربعية", roles: ["admin", "editor"] }],
  },
  {
    title: "الترجمة",
    items: [
      { href: "/admin/translations", label: "طابور الترجمات", roles: ["admin", "editor", "translator"] },
      { href: "/admin/ui-strings", label: "نصوص الواجهة", roles: ["admin", "editor", "translator"] },
    ],
  },
  {
    title: "النظام",
    items: [
      { href: "/admin/media", label: "مكتبة الملفات", roles: ["admin", "editor"] },
      { href: "/admin/users", label: "المستخدمون", roles: ["admin"] },
    ],
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { auth, flash } = usePage<SharedProps>().props;
  const url = usePage().url;
  const [open, setOpen] = useState(false);
  const role = auth?.role ?? "translator";

  const isActive = (href: string) => (href === "/admin" ? url === "/admin" : url.startsWith(href));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className={`${open ? "block" : "hidden"} border-e border-rule bg-white lg:block`}>
        <div className="sticky top-0 flex h-screen flex-col overflow-y-auto p-4">
          <Link href="/admin" className="mb-6 flex items-center gap-2">
            <img src="/assets/img/logos/mutahidoon-mark.png" alt="" className="h-8 w-auto" />
            <span className="text-sm font-bold leading-tight">متحدون<br /><span className="font-normal text-ink/60">لوحة التحكم</span></span>
          </Link>
          <nav className="flex-1 space-y-5" aria-label="أقسام اللوحة">
            {NAV.map((group) => {
              const items = group.items.filter((i) => i.roles.includes(role));
              if (items.length === 0) return null;
              return (
                <div key={group.title || "home"}>
                  {group.title && <p className="mb-1.5 px-2 text-xs font-bold text-olive">{group.title}</p>}
                  <ul className="space-y-0.5">
                    {items.map((i) => (
                      <li key={i.href}>
                        <Link
                          href={i.href}
                          onClick={() => setOpen(false)}
                          className={`block rounded-lg px-2.5 py-2 text-sm ${isActive(i.href) ? "bg-olive text-paper font-semibold" : "hover:bg-rule/50"}`}
                        >
                          {i.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-rule pt-4 text-sm">
            <p className="font-semibold">{auth?.name}</p>
            <p className="text-xs text-ink/60">{auth?.email}</p>
            <div className="mt-3 flex gap-3">
              <a href="/" target="_blank" rel="noreferrer" className="text-green underline">عرض الموقع</a>
              <button type="button" className="text-red" onClick={() => router.post("/admin/logout")}>خروج</button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-rule bg-white px-4 py-3 lg:hidden">
          <span className="font-bold">لوحة التحكم</span>
          <button type="button" className="rounded-lg border border-rule px-3 py-1.5 text-sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            القائمة
          </button>
        </div>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Flash message={flash?.success ?? null} />
          {children}
        </main>
      </div>
    </div>
  );
}
