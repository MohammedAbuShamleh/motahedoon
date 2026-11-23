import { Head, useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Button, Card, DeleteButton, Empty, ErrorSummary, IndexChip, PageHeader, Select, TextField, Toggle } from "../../components/ui";
import { send, str } from "../../lib/form";
import { BRAND_COLORS, SocialIcon, detectPlatform, type HoverEffect, type SocialPlatform, type SocialStyle, type SocialTheme } from "@/components/SocialIcon";

/* روابط التواصل الاجتماعي: قائمة مفتوحة — يُلصق الرابط فتُعرَف منصّته من
   نطاقه (ويمكن تغييرها)، ويظهر في تذييل الموقع فور الحفظ بترتيبه هنا. */

type Link = { id: number; platform: SocialPlatform; url: string; label: string | null; position: number; is_published: boolean };

function LinkForm({ link, platforms, onDone }: { link: Link | null; platforms: Record<string, string>; onDone: () => void }) {
  const form = useForm({
    url: link?.url ?? "",
    platform: (link?.platform ?? "") as string,
    label: str(link?.label),
    position: link ? String(link.position) : "",
    is_published: link?.is_published ?? true,
  });
  const e = form.errors as Record<string, string | undefined>;
  /* المنصّة تتبع الرابط ما لم يخترها المحرّر بيده */
  const [manual, setManual] = useState(Boolean(link));

  const onUrl = (v: string) => {
    form.setData((d) => {
      const found = manual ? null : detectPlatform(v);
      return { ...d, url: v, platform: found ?? d.platform };
    });
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (link) send(form, "put", `/admin/social-links/${link.id}`, onDone);
    else send(form, "post", "/admin/social-links", () => { form.reset(); setManual(false); onDone(); });
  };

  const current = (form.data.platform || detectPlatform(form.data.url) || "other") as SocialPlatform;

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorSummary errors={e} />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
        <TextField label="الرابط" dir="ltr" placeholder="https://facebook.com/…" value={form.data.url} onChange={onUrl} error={e.url} required
          hint="الصق رابط الصفحة كاملاً؛ تُعرَف المنصّة منه تلقائياً." />
        <Select label="المنصّة" value={form.data.platform}
          onChange={(v) => { setManual(true); form.setData("platform", v); }}
          options={{ "": "تلقائي من الرابط", ...platforms }} error={e.platform} />
      </div>
      {current === "other" && (
        <TextField label="الاسم الظاهر" value={form.data.label} onChange={(v) => form.setData("label", v)} error={e.label}
          hint="يظهر عند المرور على الأيقونة في التذييل، ولقارئ الشاشة." />
      )}
      <div className="flex flex-wrap items-end gap-6">
        <TextField className="w-32" label="الترتيب" type="number" dir="ltr" value={form.data.position} onChange={(v) => form.setData("position", v)} error={e.position}
          hint="فارغ = آخر القائمة" />
        <Toggle label="منشور في الموقع" checked={form.data.is_published} onChange={(v) => form.setData("is_published", v)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={form.processing}>{link ? "حفظ" : "إضافة"}</Button>
        <Button type="button" variant="ghost" onClick={onDone}>إلغاء</Button>
      </div>
    </form>
  );
}

const PREVIEW: SocialPlatform[] = ["facebook", "instagram", "x", "youtube"];

/** معاينة نمط على أرضية حبرية كالتذييل */
function StylePreview({ style }: { style: SocialStyle }) {
  return (
    <span className="flex gap-1.5 rounded-md bg-ink p-2.5">
      {PREVIEW.map((p) => {
        const [bg, fg] = BRAND_COLORS[p];
        const box = {
          outline: "border border-paper/20 text-paper/75",
          solid: "border border-paper bg-paper text-ink",
          brand: "border",
          plain: "border border-transparent text-paper/75",
        }[style];
        return (
          <span key={p} className={`grid size-8 place-items-center rounded-md ${box}`}
            style={style === "brand" ? { background: bg, color: fg, borderColor: bg === "#000000" ? "rgba(252,252,250,.2)" : bg } : undefined}>
            <SocialIcon platform={p} className={style === "plain" ? "size-5" : "size-4"} />
          </span>
        );
      })}
    </span>
  );
}

/* ---------- الألوان وأثر المرور ---------- */
const BASE: Record<SocialStyle, { icon: string; border: string; bg: string; hoverIcon: string; hoverBorder: string; hoverBg: string }> = {
  outline: { icon: "rgba(252,252,250,.75)", border: "rgba(252,252,250,.2)", bg: "transparent", hoverIcon: "#1A1A1A", hoverBorder: "#FCFCFA", hoverBg: "#FCFCFA" },
  solid: { icon: "#1A1A1A", border: "#FCFCFA", bg: "#FCFCFA", hoverIcon: "#1A1A1A", hoverBorder: "#FCFCFA", hoverBg: "#FCFCFA" },
  brand: { icon: "", border: "", bg: "", hoverIcon: "", hoverBorder: "", hoverBg: "" },
  plain: { icon: "rgba(252,252,250,.75)", border: "transparent", bg: "transparent", hoverIcon: "#FCFCFA", hoverBorder: "transparent", hoverBg: "transparent" },
};
const EFFECTS: Record<HoverEffect, string> = { default: "أثر النمط نفسه", lift: "رفع خفيف", grow: "تكبير", fill: "امتلاء من الأسفل" };
const COLORS: { key: keyof Omit<SocialTheme, "hover_effect">; label: string }[] = [
  { key: "icon", label: "لون الأيقونة" },
  { key: "border", label: "لون الإطار" },
  { key: "hover_icon", label: "لون الأيقونة عند المرور" },
  { key: "hover_border", label: "لون الإطار عند المرور" },
  { key: "hover_bg", label: "لون الأرضية عند المرور" },
];

/** لون اختياري: منتقٍ وحقل نصّي، و«افتراضي» يعيده إلى لون النمط */
function ColorField({ label, value, onChange, error }: { label: string; value: string | null; onChange: (v: string | null) => void; error?: string }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={label} value={value ?? "#FCFCFA"} onChange={(ev) => onChange(ev.target.value.toUpperCase())}
          className="size-10 shrink-0 cursor-pointer rounded-md border border-rule bg-paper p-1" />
        <input type="text" dir="ltr" value={value ?? ""} placeholder="افتراضي" maxLength={7}
          onChange={(ev) => { const v = ev.target.value.trim(); onChange(v === "" ? null : v.startsWith("#") ? v : "#" + v); }}
          className="h-10 w-28 rounded-md border border-rule bg-paper px-2 font-mono text-sm uppercase" aria-label={label + " (رمز)"} />
        {value && <button type="button" onClick={() => onChange(null)} className="text-xs font-bold text-ink/60 hover:text-red">افتراضي</button>}
      </div>
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  );
}

/** معاينة حيّة بالألوان المختارة على أرضية حبرية كالتذييل؛ المرور يُظهر أثره */
function ThemePreview({ style, theme }: { style: SocialStyle; theme: SocialTheme }) {
  const [hot, setHot] = useState<number | null>(null);
  const base = BASE[style];
  return (
    <div className="flex gap-2 rounded-md bg-ink p-3">
      {PREVIEW.map((p, i) => {
        const [bBg, bFg] = BRAND_COLORS[p];
        const brand = style === "brand";
        const on = hot === i;
        const icon = (on ? theme.hover_icon : null) ?? theme.icon ?? (brand ? bFg : on ? base.hoverIcon : base.icon);
        const border = (on ? theme.hover_border : null) ?? theme.border
          ?? (brand ? (bBg === "#000000" ? "rgba(252,252,250,.2)" : bBg) : on ? base.hoverBorder : base.border);
        let bg = brand ? bBg : on ? base.hoverBg : base.bg;
        if (on && theme.hover_bg) bg = theme.hover_bg;
        const fill = on && theme.hover_effect === "fill";
        const transform = on ? (theme.hover_effect === "lift" ? "translateY(-3px)" : theme.hover_effect === "grow" ? "scale(1.14)" : "none") : "none";
        return (
          <span key={p} onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}
            className="grid size-10 cursor-pointer place-items-center rounded-md border transition-all duration-300"
            style={{
              color: icon, borderColor: border,
              background: fill ? "transparent" : bg,
              boxShadow: fill ? "inset 0 -2.6rem 0 0 " + (theme.hover_bg ?? theme.hover_border ?? "#FCFCFA") : "none",
              transform,
            }}>
            <SocialIcon platform={p} className={style === "plain" ? "size-5" : "size-4"} />
          </span>
        );
      })}
      <span className="ms-auto self-center text-xs text-paper/55">مرّر المؤشّر للمعاينة</span>
    </div>
  );
}

const EMPTY_THEME: SocialTheme = { icon: null, border: null, hover_icon: null, hover_border: null, hover_bg: null, hover_effect: "default" };

/** إعداد العرض: الإظهار، والنمط، والألوان وأثر المرور */
function DisplayCard({ display, styles }: { display: Display; styles: Record<string, string> }) {
  const initial = {
    social_enabled: display.social_enabled,
    social_style: display.social_style,
    social_theme: { ...EMPTY_THEME, ...(display.social_theme ?? {}) } as SocialTheme,
  };
  const form = useForm(initial);
  const e = form.errors as Record<string, string | undefined>;
  const dirty = JSON.stringify(form.data) !== JSON.stringify(initial);
  const setTheme = (k: keyof SocialTheme, v: string | null) =>
    form.setData("social_theme", { ...form.data.social_theme, [k]: v } as SocialTheme);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    form.put("/admin/social-links/display", { preserveScroll: true });
  };

  return (
    <Card title="طريقة العرض في التذييل">
      <form onSubmit={submit} className="space-y-5">
        <Toggle label="إظهار روابط التواصل في تذييل الموقع" checked={form.data.social_enabled}
          onChange={(v) => form.setData("social_enabled", v)}
          hint="عند الإطفاء يختفي القسم كلّه من الموقع، وتبقى الروابط محفوظة هنا لتعود متى أعدت تشغيله." />

        <fieldset disabled={!form.data.social_enabled} className={"space-y-6 " + (form.data.social_enabled ? "" : "opacity-50")}>
          <div>
            <legend className="mb-2 text-sm font-bold">شكل الأيقونات</legend>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup">
              {(Object.entries(styles) as [SocialStyle, string][]).map(([value, label]) => {
                const on = form.data.social_style === value;
                return (
                  <label key={value}
                    className={"flex cursor-pointer flex-col gap-2.5 rounded-lg border p-3 transition " + (on ? "border-green bg-green/5 ring-1 ring-green" : "border-rule hover:border-ink/40")}>
                    <input type="radio" name="social_style" value={value} checked={on} className="sr-only"
                      onChange={() => form.setData("social_style", value)} />
                    <StylePreview style={value} />
                    <span className="flex items-center justify-between text-sm font-bold">
                      {label}
                      {on && <span className="text-green" aria-hidden="true">✓</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            {e.social_style && <p className="mt-2 text-sm text-red">{e.social_style}</p>}
          </div>

          <div className="rounded-lg border border-rule p-4">
            <p className="text-sm font-bold">الألوان (اختياري)</p>
            <p className="mt-1 text-xs leading-6 text-ink/60">اترك اللون فارغاً ليبقى لون النمط المختار. يمكن تلوين الأيقونة وحدها، أو الإطار وحده، أو كليهما.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {COLORS.slice(0, 2).map((c) => (
                <ColorField key={c.key} label={c.label} value={form.data.social_theme[c.key]}
                  onChange={(v) => setTheme(c.key, v)} error={e["social_theme." + c.key]} />
              ))}
            </div>

            <p className="mt-6 text-sm font-bold">عند المرور</p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="أثر المرور">
              {(Object.entries(EFFECTS) as [HoverEffect, string][]).map(([value, label]) => {
                const on = form.data.social_theme.hover_effect === value;
                return (
                  <button key={value} type="button" role="radio" aria-checked={on} onClick={() => setTheme("hover_effect", value)}
                    className={"rounded-lg border px-3 py-1.5 text-sm font-bold transition " + (on ? "border-ink bg-ink text-paper" : "border-rule bg-paper hover:border-ink")}>
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {COLORS.slice(2).map((c) => (
                <ColorField key={c.key} label={c.label} value={form.data.social_theme[c.key]}
                  onChange={(v) => setTheme(c.key, v)} error={e["social_theme." + c.key]} />
              ))}
            </div>

            <p className="mb-2 mt-6 text-sm font-bold">المعاينة</p>
            <ThemePreview style={form.data.social_style} theme={form.data.social_theme} />
          </div>
        </fieldset>

        <Button type="submit" disabled={form.processing || !dirty}>حفظ طريقة العرض</Button>
      </form>
    </Card>
  );
}

type Display = { social_enabled: boolean; social_style: SocialStyle; social_theme: SocialTheme | null };

export default function Index({ links, platforms, display, styles }: {
  links: Link[]; platforms: Record<string, string>; display: Display; styles: Record<string, string>;
}) {
  const [editing, setEditing] = useState<number | "new" | null>(links.length === 0 ? "new" : null);

  return (
    <AdminLayout>
      <Head title="روابط التواصل" />
      <PageHeader title="روابط التواصل الاجتماعي"
        subtitle="كلّ رابط منشور هنا يظهر أيقونةً في تذييل الموقع بالترتيب نفسه — فيسبوك وإنستغرام وX ويوتيوب وغيرها." />

      <div className="mb-6"><DisplayCard display={display} styles={styles} /></div>

      <Card title="الروابط" actions={editing !== "new" && <Button size="sm" onClick={() => setEditing("new")}>+ إضافة رابط</Button>}>
        {editing === "new" && (
          <div className="mb-5 rounded-lg border border-olive/40 bg-olive/5 p-4">
            <LinkForm link={null} platforms={platforms} onDone={() => setEditing(null)} />
          </div>
        )}
        {links.length === 0 && editing !== "new" && <Empty>لا روابط بعد. أضف أوّل رابط ليظهر في التذييل.</Empty>}
        <ol className="space-y-3">
          {links.map((l) => (
            <li key={l.id} className="rounded-lg border border-rule bg-paper p-4">
              {editing === l.id ? (
                <LinkForm link={l} platforms={platforms} onDone={() => setEditing(null)} />
              ) : (
                <div className="flex items-center gap-4">
                  <IndexChip>{l.position}</IndexChip>
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-ink text-paper">
                    <SocialIcon platform={l.platform} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {l.platform === "other" ? (l.label || platforms.other) : platforms[l.platform]}
                      {!l.is_published && <span className="ms-2"><Badge tone="olive">مخفيّ</Badge></span>}
                    </p>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" dir="ltr"
                      className="block truncate text-start text-sm text-ink/70 hover:text-green">{l.url}</a>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(l.id)}>تحرير</Button>
                    <DeleteButton small url={`/admin/social-links/${l.id}`} confirm="حذف هذا الرابط من التذييل؟" />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </Card>
    </AdminLayout>
  );
}
