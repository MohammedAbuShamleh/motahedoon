import type { ReactNode } from "react";

/* رموز اللوحة — خطّية هندسية بلا دوائر (قرار الهوية): مربّعات ليّنة
   ومعيّن الشعار وخطوط مستقيمة. الأقواس هنا زوايا مدوّرة لا دوائر. */

const PATHS = {
  home: <path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5" />,
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <rect x="13" y="5" width="4" height="4" rx="1" />
      <rect x="7" y="15" width="4" height="4" rx="1" />
    </>
  ),
  lines: (
    <>
      <path d="M10 6h10M10 12h10M10 18h10" />
      <path d="M5 4.8 6.2 6 5 7.2 3.8 6zM5 10.8 6.2 12 5 13.2 3.8 12zM5 16.8 6.2 18 5 19.2 3.8 18z" />
    </>
  ),
  partners: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  pillars: <path d="M12 3l9 9-9 9-9-9zM12 8.5l3.5 3.5-3.5 3.5L8.5 12z" />,
  photos: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 16l5-5 4 4 2.5-2.5L21 19" />
      <rect x="15" y="8" width="2.5" height="2.5" rx=".5" />
    </>
  ),
  video: <path d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1.5-1.5zM10 9.2v5.6l4.6-2.8z" />,
  reports: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" />,
  translations: <path d="M4 5h9M8.5 3v2M6 5c.9 3.2 3.2 5.7 6 7M11 5c-.9 3.2-3.2 5.7-6 7M13 21l4-9 4 9M14.4 18h5.2" />,
  strings: <path d="M5 7V4.5h14V7M12 4.5v15M9 19.5h6" />,
  media: <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.5h7.5A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />,
  users: (
    <>
      <rect x="8.5" y="3.5" width="7" height="7" rx="2" />
      <path d="M4.5 20.5c.9-3.7 3.9-6 7.5-6s6.6 2.3 7.5 6" />
    </>
  ),
  site: <path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />,
  logout: <path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10M15 8l4 4-4 4M19 12H9" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="M5 12.5 10 17.5 19 7" />,
  up: <path d="M6 15l6-6 6 6" />,
  down: <path d="M6 9l6 6 6-6" />,
  right: <path d="M9 6l6 6-6 6" />,
  left: <path d="M15 6l-6 6 6 6" />,
} satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof PATHS;

export function Glyph({ name, className = "size-5" }: { name: GlyphName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}
