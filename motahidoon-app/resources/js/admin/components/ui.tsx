import { Link, router } from "@inertiajs/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { MediaBrief } from "../types";

/* عناصر اللوحة الأساسية. الاتجاه RTL، والخصائص منطقية (ms/me/ps/pe/start/end). */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/65">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = "" }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-rule bg-white p-5 shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-base font-bold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-olive text-paper hover:bg-ink",
  secondary: "border border-rule bg-white text-ink hover:border-olive hover:text-olive",
  danger: "border border-red/30 bg-white text-red hover:bg-red hover:text-paper",
  ghost: "text-ink/70 hover:text-olive",
};
const BTN = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50";

export function Button({ variant = "primary", className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" {...rest} className={`${BTN} ${VARIANTS[variant]} ${className}`} />;
}

export function LinkButton({ href, children, variant = "secondary" }: { href: string; children: ReactNode; variant?: Variant }) {
  return <Link href={href} className={`${BTN} ${VARIANTS[variant]}`}>{children}</Link>;
}

export function SubmitBar({ processing, label = "حفظ", extra }: { processing: boolean; label?: string; extra?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-6 flex items-center gap-3 border-t border-rule bg-paper/95 px-1 py-3 backdrop-blur">
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
      className={small ? "px-2.5 py-1 text-xs" : ""}
      onClick={() => {
        if (window.confirm(message)) router.delete(url, { preserveScroll: true });
      }}
    >
      {label}
    </Button>
  );
}

export function Field({ label, error, hint, children, className = "" }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink/60">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-semibold text-red">{error}</span>}
    </label>
  );
}

const INPUT = "w-full rounded-lg border border-rule bg-white px-3 py-2 text-sm outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20";

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
        className={INPUT}
      />
    </Field>
  );
}

export function TextArea({ label, value, onChange, error, hint, dir, rows = 3, className }: TextProps & { rows?: number }) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      <textarea dir={dir} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT} leading-7`} />
    </Field>
  );
}

export function Select({ label, value, onChange, options, error, className }: {
  label: string; value: string; onChange: (v: string) => void; options: Record<string, string>; error?: string; className?: string;
}) {
  return (
    <Field label={label} error={error} className={className}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT}>
        {Object.entries(options).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4 accent-olive" />
      <span>
        <span className="font-semibold">{label}</span>
        {hint && <span className="block text-xs text-ink/60">{hint}</span>}
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
    <Field label={label} error={error} hint={hint}>
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-rule bg-white p-3">
        {shown && isImage ? (
          <img src={shown} alt="" className="size-16 rounded-md border border-rule object-contain" />
        ) : shown ? (
          <a href={shown} target="_blank" rel="noreferrer" className="text-sm font-semibold text-green underline">الملف الحالي</a>
        ) : (
          <span className="grid size-16 place-items-center rounded-md bg-rule/40 text-xs text-ink/50">لا شيء</span>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="text-xs file:me-2 file:rounded-md file:border-0 file:bg-olive file:px-2.5 file:py-1.5 file:text-paper" />
          {current && !file && (
            <Toggle label="إزالة الحالي" checked={remove} onChange={onRemove} />
          )}
        </div>
      </div>
    </Field>
  );
}

export function Flash({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" className="mb-5 rounded-lg border border-green/30 bg-green/10 px-4 py-2.5 text-sm font-semibold text-green">
      {message}
    </div>
  );
}

export function ErrorSummary({ errors }: { errors: Record<string, string | undefined> }) {
  const list = Object.values(errors).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div role="alert" className="mb-5 rounded-lg border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
      <p className="font-bold">تعذّر الحفظ — راجع الحقول:</p>
      <ul className="mt-1 list-disc ps-5">{list.slice(0, 8).map((e, i) => <li key={i}>{e}</li>)}</ul>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "olive" | "red" }) {
  const tones = {
    neutral: "bg-rule/60 text-ink/80",
    green: "bg-green/10 text-green",
    olive: "bg-olive/10 text-olive",
    red: "bg-red/10 text-red",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Pagination({ links }: { links: { url: string | null; label: string; active: boolean }[] }) {
  if (links.length <= 3) return null;
  return (
    <nav className="mt-5 flex flex-wrap gap-1" aria-label="ترقيم الصفحات">
      {links.map((l, i) => (
        <Link
          key={i}
          href={l.url ?? "#"}
          preserveScroll
          className={`rounded-md px-3 py-1.5 text-sm ${l.active ? "bg-olive text-paper" : "border border-rule bg-white"} ${l.url ? "" : "pointer-events-none opacity-40"}`}
          dangerouslySetInnerHTML={{ __html: l.label.replace("&laquo; Previous", "السابق").replace("Next &raquo;", "التالي") }}
        />
      ))}
    </nav>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-rule p-6 text-center text-sm text-ink/60">{children}</p>;
}
