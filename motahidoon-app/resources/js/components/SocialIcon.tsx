/* أيقونات منصّات التواصل — خطّية بسماكة واحدة كبقية أيقونات الموقع،
   مشتركة بين التذييل ولوحة التحكّم. المفاتيح مطابقة لـ App\Enums\SocialPlatform. */

import type { ReactElement } from "react";

export type SocialPlatform =
  | "facebook" | "instagram" | "x" | "youtube" | "telegram" | "tiktok"
  | "whatsapp" | "linkedin" | "snapchat" | "threads" | "other";

export interface SocialLink { platform: SocialPlatform; url: string; label: string | null }

/** نمط الأيقونات — مطابق لـ App\Enums\SocialIconStyle. */
export type SocialStyle = "outline" | "solid" | "brand" | "plain";

/** ما يرسله الخادم للتذييل (SocialLinkService::forFooter). */
/** ألوان الأيقونات وأثر المرور (social_theme): null = لون النمط نفسه. */
export type HoverEffect = "default" | "lift" | "grow" | "fill";
export interface SocialTheme {
  icon: string | null; border: string | null;
  hover_icon: string | null; hover_border: string | null; hover_bg: string | null;
  hover_effect: HoverEffect;
}
export interface SocialFooter { enabled: boolean; style: SocialStyle; theme: SocialTheme; links: SocialLink[] }

/** أصناف ومتغيّرات CSS لصفّ الأيقونات من الألوان المختارة — للتذييل ولمعاينة اللوحة. */
export function themeAttrs(t: SocialTheme | undefined): { className: string; style: Record<string, string> } {
  if (!t) return { className: "", style: {} };
  const map: [keyof SocialTheme, string, string][] = [
    ["icon", "is-icon", "--soc-icon"], ["border", "is-border", "--soc-border"],
    ["hover_icon", "is-hicon", "--soc-hicon"], ["hover_border", "is-hborder", "--soc-hborder"],
    ["hover_bg", "is-hbg", "--soc-hbg"],
  ];
  const cls: string[] = [];
  const style: Record<string, string> = {};
  for (const [key, c, v] of map) {
    const val = t[key];
    if (val) { cls.push(c); style[v] = val; }
  }
  if (t.hover_effect && t.hover_effect !== "default") cls.push(`fx-${t.hover_effect}`);
  return { className: cls.join(" "), style };
}

/** ألوان المنصّات الرسمية لنمط «brand»: الأرضية ثم لون الأيقونة فوقها.
    الأسود الرسمي (X وTikTok وThreads) يأخذ حدّاً فاتحاً في CSS ليبين على التذييل الحبري. */
export const BRAND_COLORS: Record<SocialPlatform, [bg: string, fg: string]> = {
  facebook: ["#1877F2", "#FFFFFF"],
  instagram: ["#E4405F", "#FFFFFF"],
  x: ["#000000", "#FFFFFF"],
  youtube: ["#FF0000", "#FFFFFF"],
  telegram: ["#26A5E4", "#FFFFFF"],
  tiktok: ["#000000", "#FFFFFF"],
  whatsapp: ["#25D366", "#FFFFFF"],
  linkedin: ["#0A66C2", "#FFFFFF"],
  snapchat: ["#FFFC00", "#1A1A1A"],
  threads: ["#000000", "#FFFFFF"],
  other: ["#5C5B34", "#FFFFFF"],
};

/** أسماء المنصّات علامات تجارية: تُكتب كما هي في كلّ لغة. */
export const SOCIAL_NAMES: Record<SocialPlatform, string> = {
  facebook: "Facebook", instagram: "Instagram", x: "X", youtube: "YouTube", telegram: "Telegram",
  tiktok: "TikTok", whatsapp: "WhatsApp", linkedin: "LinkedIn", snapchat: "Snapchat", threads: "Threads",
  other: "",
};

/** نطاقات كلّ منصّة — نسخة مطابقة لـ SocialPlatform::detect() في الخادم. */
const HOSTS: [SocialPlatform, string[]][] = [
  ["facebook", ["facebook.com", "fb.com", "fb.me"]],
  ["instagram", ["instagram.com"]],
  ["x", ["x.com", "twitter.com"]],
  ["youtube", ["youtube.com", "youtu.be"]],
  ["telegram", ["t.me", "telegram.me", "telegram.org"]],
  ["tiktok", ["tiktok.com"]],
  ["whatsapp", ["wa.me", "whatsapp.com"]],
  ["linkedin", ["linkedin.com"]],
  ["snapchat", ["snapchat.com"]],
  ["threads", ["threads.net", "threads.com"]],
];

/** المنصّة من الرابط الملصوق، أو null إن لم يكن رابطاً صالحاً بعد. */
export function detectPlatform(url: string): SocialPlatform | null {
  let host: string;
  try {
    host = new URL(url.trim()).hostname.toLowerCase().replace(/^(www\.|m\.|web\.|mobile\.)/, "");
  } catch {
    return null;
  }
  const hit = HOSTS.find(([, hosts]) => hosts.some((h) => host === h || host.endsWith(`.${h}`)));
  return hit ? hit[0] : "other";
}

/** الاسم الظاهر للرابط: اسم المنصّة، أو ما كتبه المحرّر لـ«أخرى». */
export function socialName(l: Pick<SocialLink, "platform" | "label">): string {
  return l.platform === "other" ? (l.label ?? "") : SOCIAL_NAMES[l.platform];
}

const PATHS: Record<SocialPlatform, ReactElement> = {
  facebook: <path d="M14.5 8H16V4.5h-2.2C11.3 4.5 10 6 10 8.4V10H8v3.5h2v6h3.5v-6h2.3l.5-3.5h-2.8V8.6c0-.4.3-.6 1-.6z" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <path d="M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM16.8 7.2h.01" />
    </>
  ),
  x: <path d="M4.5 4.5h4l11 15h-4zM19.5 4.5l-6.3 6.9M4.5 19.5l6.3-6.9" />,
  youtube: <path d="M3.5 8.6C3.5 7 4.6 6 6.2 5.9 8 5.8 10 5.7 12 5.7s4 .1 5.8.2c1.6.1 2.7 1.1 2.7 2.7v6.8c0 1.6-1.1 2.6-2.7 2.7-1.8.1-3.8.2-5.8.2s-4-.1-5.8-.2c-1.6-.1-2.7-1.1-2.7-2.7zM10.3 9.3v5.4l4.6-2.7z" />,
  telegram: <path d="M20.5 4.5 3.5 11.2l5.6 1.9 1.9 6 3-3.8 4.6 3.3zM9.1 13.1l11.4-8.6" />,
  tiktok: <path d="M13.5 4v10.6a3.4 3.4 0 1 1-3.4-3.4M13.5 4c.4 2.4 2.2 4.1 4.8 4.3" />,
  whatsapp: <path d="M4.5 19.5l1.2-3.9A7.9 7.9 0 1 1 8.6 18.4zM9.2 8.6c-.3 1.6.7 3.6 2.2 4.9 1.3 1.1 2.9 1.8 4 1.4l.6-1.4-1.9-.9-.9.8c-.9-.4-1.8-1.3-2.2-2.2l.8-.9-.8-1.9z" />,
  linkedin: <path d="M6 10v9M6 5.5v.01M10.5 19v-9M10.5 13.5c0-2 1.3-3.6 3.2-3.6 1.9 0 3.3 1.3 3.3 3.8V19" />,
  snapchat: <path d="M12 4.5c2.9 0 4.6 2 4.6 4.6v2.1l1.9.7c-.2.9-1.3 1.1-2 1.3.6 1.6 1.8 2.7 3 3.1-.7.9-1.9.9-2.7 1.1l-.4 1.3c-1-.2-1.9-.3-2.9.4-.6.4-1 .6-1.5.6s-.9-.2-1.5-.6c-1-.7-1.9-.6-2.9-.4L7.2 17c-.8-.2-2-.2-2.7-1.1 1.2-.4 2.4-1.5 3-3.1-.7-.2-1.8-.4-2-1.3l1.9-.7V9.1c0-2.6 1.7-4.6 4.6-4.6z" />,
  threads: <path d="M16.2 11.3c-.6-2.3-2.3-3.3-4.2-3.3-2.6 0-4.4 1.9-4.4 4.6 0 2.9 1.9 4.9 4.6 4.9 2.3 0 3.7-1.3 3.7-3.1 0-1.7-1.3-2.7-3.3-2.7-1.6 0-2.6.8-2.6 1.9 0 1 .9 1.6 2 1.6 2.4 0 3.1-2.3 2.9-4.9M19 12c0 4.3-2.9 7.5-7 7.5S5 16.3 5 12s2.9-7.5 7-7.5c3 0 5.2 1.6 6.3 4.2" />,
  other: <path d="M10.2 13.8a3.7 3.7 0 0 0 5.3 0l3-3a3.7 3.7 0 0 0-5.3-5.3l-1 1M13.8 10.2a3.7 3.7 0 0 0-5.3 0l-3 3a3.7 3.7 0 0 0 5.3 5.3l1-1" />,
};

export function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}
      fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[platform] ?? PATHS.other}
    </svg>
  );
}
