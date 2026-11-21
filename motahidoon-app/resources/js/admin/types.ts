/** أنواع اللوحة المشتركة — تطابق ما ترسله Resources في app/Http/Resources/Admin. */

export type Role = "admin" | "editor" | "translator";

export type SharedProps = {
  auth: { name: string; email: string; role: Role } | null;
  flash: { success: string | null };
};

export type MediaBrief = { id: number; url: string } | null;

/** قيم الترجمة لنموذج: [locale][field]. */
export type Translations = {
  en: Record<string, string | null>;
  tr: Record<string, string | null>;
};

export type Option = { value: string; label: string; hasTerm?: boolean };

export type TableData = {
  title: string | null;
  head: string[];
  rows: string[][];
  foot: string[] | null;
  foot_note: string | null;
};

export type FigureRow = {
  id?: number;
  value: string;
  prefix: string | null;
  unit: string | null;
  label: string;
  accent: boolean;
};

/** شكل مجموعة Resource مرقّمة: الروابط المرقّمة في meta.links. */
export type Paginated<T> = {
  data: T[];
  meta?: { total: number; current_page: number; last_page: number; links: { url: string | null; label: string; active: boolean }[] };
};
