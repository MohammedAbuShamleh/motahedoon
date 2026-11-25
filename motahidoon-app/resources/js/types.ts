/* أنواع المحتوى — مرآة لبنية data.js.
   الحقول المحجوزة `| null` عمداً: الموقع يرسمها خانات موسومة، فلا
   يُسمح لـTypeScript أن يوحي بأنها موجودة دائماً. */

import type { SocialFooter } from "@/components/SocialIcon";

export type Locale = "ar" | "en" | "tr";

export interface Org {
  name: string;
  shortName: string;
  tagline: string;
  logoFull: string;
  logoMark: string;
}

export interface Cover {
  src: string;
  caption: string;
}

export interface Pillar {
  id: string;
  num: string;
  title: string;
  short: string;
  orgs: string;
  definition: string | null;
  cover: Cover | null;
}

export interface Partner {
  id: string;
  name: string;
  logo: string | null;
  site: string | null;
  role: string | null;
  about: string | null;
}

export interface Identity {
  vision: string;
  mission: string;
  values: (Entry | string)[];
}

export interface Founding {
  year: string;
  story: string[];
}

export interface Metric {
  value: string;          // "12,013,597" — نصّ عمداً. لا يُنسَّق ولا يُختصر.
  prefix?: string | null;
  unit?: string | null;
  label: string;
  accent?: boolean;
}

/** بند: نصّ وحده، أو نصّ معنون. recap = فقرة خلاصة تُطوى ولا تُحذف. */
export interface Entry {
  term?: string;
  text: string;
  recap?: boolean;
}

export interface ReportGroup {
  num?: string;
  title?: string;
  items: Entry[];
  recap?: boolean;
  /** بطاقات محرَّرة من اللوحة؛ غيابها = استخراج من البنود */
  stats?: Stat[] | null;
}

export interface FigureBlock {
  title: string;
  figures: Metric[];
  note?: { term: string; text: string };
}

export interface ReportTable {
  title?: string;
  head: string[];
  rows: string[][];
  foot?: string[];
  footNote?: string;
}

export interface GalleryItem { src: string; caption: string }

export interface ReportSection {
  lead: string;
  groups?: ReportGroup[] | null;
  blocks?: FigureBlock[] | null;
  table?: ReportTable | null;
  gallery?: GalleryItem[] | null;
  stats?: Stat[] | null;
  untranslated?: boolean;
}

export interface Stat { value: string; unit: string }

export interface TitledList {
  title: string;
  items: (Entry | string)[];
}

export interface Report {
  id: string;
  label: string;
  range: string;
  reportTitle: string;
  reportFile: string | null;
  metricsTitle: string;
  metrics: Metric[];
  notice: string[] | null;
  intro: string[];
  highlights: string[] | null;
  sections: Record<string, ReportSection>;
  summary: { title: string; head: string[]; rows: string[][]; foot?: string[] } | null;
  appeal: {
    title: string; lead: string; items: string[];
    photo?: { src: string; caption: string };
  } | null;
  reading: TitledList | null;
  dataNotes: TitledList | null;
  opportunities: TitledList | null;
  closing: { title: string; paragraphs: string[]; signoff: string } | null;
  untranslated?: boolean;
}

export interface Contact {
  email: string | null;
  phone: string | null;
  address: string | null;
  social: Record<string, string | null>;
}

export interface Donors {
  donateUrl: string | null;
  donateQr: string | null;
  donateLabel: string;
}

/** ما يشاركه HandleInertiaRequests مع كل صفحة. */
export interface SharedProps {
  locale: Locale;
  locales: Locale[];
  ui: Record<string, string>;
  unapproved: string | null;
  org: Org;
  contact: Contact;
  donors: Donors;
  mediaOffice: string;
  /** رابط محادثة واتساب الجاهز (wa.me + النصّ) لزرّ التواصل العائم */
  whatsapp: string | null;
  /** روابط التواصل للتذييل: الإظهار والنمط والروابط المنشورة (صفحة «روابط التواصل» في اللوحة) */
  social: SocialFooter;
  footerData: {
    pillars: { id: string; short: string }[];
    partners: { name: string }[];
    current: { label: string; range: string; reportTitle: string } | null;
  };
  [key: string]: unknown;
}

/* ---------- مكتبة الفيديو (VideoLibrary في الخادم) ---------- */

/** مقطع جاهز للعرض: رابط مضمَّن (youtube/facebook) أو ملف مرفوع (file). */
export interface VideoItem {
  id: number;
  title: string;
  description: string | null;
  kind: "youtube" | "facebook" | "file";
  embed: string | null;   // للروابط: عنوان iframe، يُحمَّل بعد النقر وحده
  src: string | null;     // للملفات: مسار الملف
  poster: string | null;
  duration: string | null;
  date: string | null;
  featured: boolean;
  album: { slug: string; title: string };
}

export interface VideoAlbumCard {
  slug: string;
  title: string;
  description?: string | null;
  cover: string | null;
  count: number;
  pillar?: string | null;
}

export interface VideoAlbumFull extends VideoAlbumCard {
  videos: VideoItem[];
}
