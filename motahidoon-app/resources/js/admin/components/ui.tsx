import { Link, router } from "@inertiajs/react";
import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { MediaBrief } from "../types";
import { Glyph } from "./icons";

/* عناصر اللوحة بهوية الموقع: الحبري والورق والفواصل أرضيةً، والأخضر
   والزيتوني لمسات، والأحمر خطّاً أو نقطةً لا مساحة. لا دوائر: الزوايا
   مربّعات ليّنة، ومؤشّرات القوائم مربّعة، والعلامات معيّن الشعار.
   الاتجاه RTL والخصائص منطقية (ms/me/ps/pe/start/end). */

/** قسم الصفحة في القائمة («المتن — دائم»…): توفّره AdminLayout ويعرضه رأس الصفحة. */
export const SectionContext = createContext("");

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  const section = useContext(SectionContext);
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-rule pb-6">
      <div className="min-w-0">
        {section && (
          <p className="mb-2.5 flex items-center gap-2.5 text-xs font-bold text-olive">
            <span aria-hidden="true" className="h-0.5 w-6 bg-green" />
            {section}
          </p>
        )}
        <h1 className="text-[1.75rem] font-black leading-tight sm:text-[2rem]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/65">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** علامة العنوان: معيّن زيتوني صغير — معيّن الشعار، لا نقطة مدوّرة. */
function Mark({ tone = "olive" }: { tone?: "olive" | "red" }) {
  return <span aria-hidden="true" className={`size-2 shrink-0 rotate-45 ${tone === "red" ? "bg-red" : "bg-olive"}`} />;
}

export function Card({ title, actions, children, className = "", flush = false, tone = "olive" }: {
  title?: string; actions?: ReactNode; children: ReactNode; className?: string;
  /** بلا حشوة داخلية: للقوائم التي تمتدّ فواصلها إلى حافّتي البطاقة */
  flush?: boolean;
  /** لون علامة العنوان: الأحمر للخانات المنتظرة وحدها */
  tone?: "olive" | "red";
}) {
  return (
    <section className={`rounded-xl border border-rule bg-paper shadow-[0_1px_2px_rgba(26,26,26,.04)] ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-3.5">
          {title ? <h2 className="flex items-center gap-2.5 text-[0.95rem] font-bold"><Mark tone={tone} />{title}</h2> : <span />}
          {actions}
        </div>
      )}
      <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm" | "icon";
/* الزرّ الرئيس حبري ويصير زيتونياً عند المرور — كأزرار الموقع العام */
const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-olive",
  secondary: "border border-rule bg-paper text-ink hover:border-olive hover:text-olive",
  danger: "border border-red/35 bg-paper text-red hover:border-red hover:bg-red hover:text-paper",
  ghost: "text-ink/70 hover:bg-rule/60 hover:text-ink",
};
const SIZES: Record<Size, string> = { md: "h-10 px-4 text-sm", sm: "h-8 px-2.5 text-xs", icon: "size-8 text-xs" };
const BTN = "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-bold transition disabled:pointer-events-none disabled:opacity-45";

export function Button({ variant = "primary", size = "md", className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type="button" {...rest} className={`${BTN} ${SIZES[size]} ${VARIANTS[variant]} ${className}`} />;
}

export function LinkButton({ href, children, variant = "secondary", size = "md" }: { href: string; children: ReactNode; variant?: Variant; size?: Size }) {
  return <Link href={href} className={`${BTN} ${SIZES[size]} ${VARIANTS[variant]}`}>{children}</Link>;
}

/** شريط الحفظ اللاصق أسفل النماذج — يمتدّ إلى حافّتي منطقة المحتوى. */
export function SubmitBar({ processing, label = "حفظ", extra }: { processing: boolean; label?: string; extra?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-wrap items-center gap-3 border-t border-rule bg-paper/95 px-4 py-3.5 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <Button type="submit" disabled={processing}>{processing ? "جارٍ الحفظ…" : label}</Button>
      {extra}
    </div>
  );
}

/** حذف بتأكيد صريح — لا حذف بنقرة واحدة. */
export function DeleteButton({ url, confirm: message = "حذف نهائي؟ لا يمكن التراجع.", label = "حذف", small = false }: { url: string; confirm?: string; label?: string; small?: boolean }) {
  return (
    <Button
      variant="danger"
      size={small ? "sm" : "md"}
      onClick={() => {
        if (window.confirm(message)) router.delete(url, { preserveScroll: true });
      }}
    >
      {label}
    </Button>
  );
}

/** نصّ خطأ: معيّن أحمر صغير ثم الرسالة — الأحمر نقطةً لا مساحة. */
export function ErrorText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`mt-1.5 flex items-start gap-1.5 text-xs font-bold leading-5 text-red ${className}`}>
      <span aria-hidden="true" className="mt-[0.4rem] size-1.5 shrink-0 rotate-45 bg-red" />
      <span>{children}</span>
    </span>
  );
}

/** حقل بعنوانه وتلميحه وخطئه. as="div" حين يحوي الحقل عناصر تفاعلية أخرى (تسمية داخل تسمية لا تصحّ). */
export function Field({ label, error, hint, children, className = "", as = "label" }: {
  label: string; error?: string; hint?: string; children: ReactNode; className?: string; as?: "label" | "div";
}) {
  const Tag = as;
  return (
    <Tag className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs leading-5 text-ink/60">{hint}</span>}
      {error && <ErrorText>{error}</ErrorText>}
    </Tag>
  );
}

export const inputClass =
  "w-full rounded-lg border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 " +
  "focus:border-olive focus:ring-4 focus:ring-olive/15 aria-[invalid=true]:border-red/70";

/** زرّ اختيار الملف بلغة الأزرار: حبري يصير زيتونياً. */
export const fileInputClass =
  "max-w-full text-xs text-ink/70 file:me-3 file:h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-ink file:px-3.5 " +
  "file:text-xs file:font-bold file:text-paper file:transition hover:file:bg-olive";

type TextProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  dir?: "rtl" | "ltr" | "auto";
  placeholder?: string;
  className?: string;
  required?: boolean;
};

export function TextField({ label, value, onChange, error, hint, type = "text", dir, placeholder, className, required }: TextProps) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      <input
        type={type}
        dir={dir}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={inputClass}
      />
    </Field>
  );
}

export function TextArea({ label, value, onChange, error, hint, dir, rows = 3, className }: TextProps & { rows?: number }) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      <textarea dir={dir} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} className={`${inputClass} leading-7`} />
    </Field>
  );
}

export function Select({ label, value, onChange, options, error, className }: {
  label: string; value: string; onChange: (v: string) => void; options: Record<string, string>; error?: string; className?: string;
}) {
  return (
    <Field label={label} error={error} className={className}>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} className={`${inputClass} cursor-pointer`}>
        {Object.entries(options).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-olive" />
      <span>
        <span className="font-bold">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-5 text-ink/60">{hint}</span>}
      </span>
    </label>
  );
}

/** صورة/ملف واحد: الحالي، أو ملف جديد، أو إزالة. */
export function FileField({ label, current, file, remove, onFile, onRemove, error, accept = "image/*", hint, isImage = true }: {
  label: string; current: MediaBrief; file: File | null; remove: boolean;
  onFile: (f: File | null) => void; onRemove: (v: boolean) => void;
  error?: string; accept?: string; hint?: string; isImage?: boolean;
}) {
  const preview = file && isImage ? URL.createObjectURL(file) : null;
  const shown = preview ?? (!remove && current ? current.url : null);

  return (
    <Field as="div" label={label} error={error} hint={hint}>
      <div className="flex items-center gap-4 rounded-lg border border-dashed border-rule bg-rule/20 p-3">
        {shown && isImage ? (
          <img src={shown} alt="" className="size-16 shrink-0 rounded-md border border-rule bg-paper object-contain p-1" />
        ) : shown ? (
          <a href={shown} target="_blank" rel="noreferrer" className="inline-flex h-16 shrink-0 items-center gap-1.5 rounded-md border border-rule bg-paper px-3 text-xs font-bold text-green transition hover:text-olive">
            <Glyph name="reports" className="size-4" />
            الملف الحالي
          </a>
        ) : (
          <span className="grid size-16 shrink-0 place-items-center rounded-md border border-rule bg-paper text-xs text-ink/45">لا شيء</span>
        )}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <input type="file" accept={accept} aria-label={label} onChange={(e) => onFile(e.target.files?.[0] ?? null)} className={fileInputClass} />
          {current && !file && <Toggle label="إزالة الحالي" checked={remove} onChange={onRemove} />}
        </div>
      </div>
    </Field>
  );
}

export function Flash({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="mb-6 flex items-center gap-3 rounded-lg border border-rule border-s-[3px] border-s-green bg-paper px-4 py-3 text-sm font-bold shadow-[0_1px_2px_rgba(26,26,26,.04)]">
      <Glyph name="check" className="size-5 shrink-0 text-green" />
      {message}
    </div>
  );
}

export function ErrorSummary({ errors }: { errors: Record<string, string | undefined> }) {
  const list = Object.values(errors).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div role="alert" className="mb-6 rounded-lg border border-rule border-s-[3px] border-s-red bg-red/[0.04] px-4 py-3 text-sm">
      <p className="font-bold">تعذّر الحفظ — راجع الحقول:</p>
      <ul className="mt-1.5 list-[square] space-y-0.5 ps-5 text-ink/80 marker:text-red">{list.slice(0, 8).map((e, i) => <li key={i}>{e}</li>)}</ul>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "olive" | "red" }) {
  const tones = {
    neutral: "bg-rule/70 text-ink/75",
    green: "bg-green/10 text-green",
    olive: "bg-olive/10 text-olive",
    red: "bg-paper text-red ring-1 ring-inset ring-red/35",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-bold ${tones[tone]}`}>
      {tone === "red" && <span aria-hidden="true" className="size-1.5 rotate-45 bg-red" />}
      {children}
    </span>
  );
}

/** رقم الترتيب في مربّع ليّن زيتوني — كرموز شريط المجالات في الموقع. */
export function IndexChip({ children }: { children: ReactNode }) {
  return <span className="grid h-8 min-w-8 shrink-0 place-items-center rounded-md bg-olive/10 px-1.5 text-xs font-black tabular-nums text-olive">{children}</span>;
}

/** وسم اللغة اللاتيني: EN / TR على الحبري. */
export function LocaleTag({ locale }: { locale: string }) {
  return <span dir="ltr" className="inline-flex h-6 items-center rounded-md bg-ink px-2 text-[0.7rem] font-black tracking-wide text-paper">{locale.toUpperCase()}</span>;
}

export function Pagination({ links }: { links: { url: string | null; label: string; active: boolean }[] }) {
  if (links.length <= 3) return null;
  return (
    <nav className="mt-6 flex flex-wrap gap-1.5" aria-label="ترقيم الصفحات">
      {links.map((l, i) => (
        <Link
          key={i}
          href={l.url ?? "#"}
          preserveScroll
          aria-current={l.active ? "page" : undefined}
          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-bold tabular-nums transition ${l.active ? "bg-ink text-paper" : "border border-rule bg-paper text-ink hover:border-olive hover:text-olive"} ${l.url ? "" : "pointer-events-none opacity-40"}`}
          dangerouslySetInnerHTML={{ __html: l.label.replace("&laquo; Previous", "السابق").replace("Next &raquo;", "التالي") }}
        />
      ))}
    </nav>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-rule bg-rule/15 px-6 py-10 text-center text-sm text-ink/60">{children}</p>;
}
