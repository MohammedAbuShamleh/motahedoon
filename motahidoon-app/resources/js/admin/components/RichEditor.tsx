import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { isHtml } from "@/lib/rich";
import { Field } from "./ui";

/* القوائم مطابقة لقائمة السماح في الخادم (RichTextStyle) — ما يخرج عنها
   يُحذف عند الحفظ. اللوحة مقفلة: أربعة ألوان نصّ تجتاز AA على الورق،
   وتظليل واحد رمادي. الأحمر للكلمة لا للمساحة. */
const COLORS = [
  { v: "#1A1A1A", name: "حبري" },
  { v: "#0C7B3F", name: "أخضر" },
  { v: "#5C5B34", name: "زيتوني" },
  { v: "#CF2129", name: "أحمر — لكلمة لا لفقرة" },
];
const MARK = "#E3E4E5";
const FONTS = [
  { v: "", name: "خطّ الموقع" },
  { v: '"Thmanyah Sans"', name: "ثمانية Sans" },
  { v: '"Thmanyah Serif Text"', name: "ثمانية Serif نصّ" },
  { v: '"Thmanyah Serif Display"', name: "ثمانية Serif عرض" },
];
const SIZES = ["", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const LINE_HEIGHTS = ["", "1.4", "1.6", "1.8", "2"];

/** نصّ قديم بلا وسوم ← فقرات، ليفتحه المحرّر دون أن يدمج أسطره. */
function toEditorHtml(v: string): string {
  if (!v || isHtml(v)) return v;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return v.split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join("");
}

function xsrf(): string {
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

/**
 * محرّر نصّ منسَّق بأدوات Word: العناوين والخطوط والأحجام والألوان والمحاذاة
 * والقوائم والجداول والصور والروابط. يُخرج HTML يُنقّى في الخادم قبل الحفظ.
 *
 * lazy: يُعرض النصّ معاينةً ولا يُنشأ المحرّر حتى يُنقر — صفحة المجال قد
 * تحمل عشرات البنود، وعشرات المحرّرات دفعة واحدة تُثقل الصفحة.
 */
export function RichEditor({ label, value, onChange, error, hint, dir = "rtl", compact = false, lazy = false, placeholder, className }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  dir?: "rtl" | "ltr";
  compact?: boolean;
  lazy?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [active, setActive] = useState(!lazy);

  return (
    <Field label={label} error={error} hint={hint} className={className} as="div">
      {active ? (
        <LiveEditor value={value} onChange={onChange} dir={dir} compact={compact} placeholder={placeholder} invalid={!!error} autofocus={lazy} />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          dir={dir}
          className={`rte__preview block w-full rounded-lg border bg-paper p-3 text-start transition hover:border-green ${error ? "border-red" : "border-rule"}`}
        >
          {value
            ? isHtml(value)
              ? <span className="rte__content block" dangerouslySetInnerHTML={{ __html: value }} />
              : <span className="block whitespace-pre-line leading-7">{value}</span>
            : <span className="text-ink/45">{placeholder ?? "انقر للكتابة…"}</span>}
          <span className="mt-2 block text-xs font-bold text-green">انقر للتحرير بالتنسيق</span>
        </button>
      )}
    </Field>
  );
}

function LiveEditor({ value, onChange, dir, compact, placeholder, invalid, autofocus }: {
  value: string; onChange: (v: string) => void; dir: "rtl" | "ltr"; compact: boolean;
  placeholder?: string; invalid: boolean; autofocus: boolean;
}) {
  // آخر قيمة أخرجها المحرّر: ما يختلف عنها تغيّر من الخارج (حذف بند أو ترتيبه)
  const emitted = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"], defaultAlignment: dir === "rtl" ? "right" : "left" }),
      TextStyleKit.configure({ backgroundColor: false }),
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TableKit.configure({ table: { resizable: true } }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder ?? "اكتب هنا…" }),
    ],
    content: toEditorHtml(value),
    autofocus: autofocus ? "end" : false,
    editorProps: { attributes: { dir, class: `rte__content ${compact ? "min-h-20" : "min-h-40"}` } },
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? "" : ed.getHTML();
      emitted.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(toEditorHtml(value), { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className={`rte overflow-hidden rounded-lg border bg-paper ${invalid ? "border-red" : "border-rule focus-within:border-green"}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="px-3 py-2" />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"), italic: e.isActive("italic"), underline: e.isActive("underline"),
      strike: e.isActive("strike"), sub: e.isActive("subscript"), sup: e.isActive("superscript"),
      mark: e.isActive("highlight"), link: e.isActive("link"),
      bullet: e.isActive("bulletList"), ordered: e.isActive("orderedList"), quote: e.isActive("blockquote"),
      table: e.isActive("table"),
      block: e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3"
        : e.isActive("heading", { level: 4 }) ? "h4" : "p",
      align: (["right", "center", "left", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "",
      color: (e.getAttributes("textStyle").color as string | undefined)?.toUpperCase() ?? "",
      font: (e.getAttributes("textStyle").fontFamily as string | undefined) ?? "",
      size: (e.getAttributes("textStyle").fontSize as string | undefined) ?? "",
      lineHeight: (e.getAttributes("textStyle").lineHeight as string | undefined) ?? "",
      canUndo: e.can().undo(), canRedo: e.can().redo(),
    }),
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const c = () => editor.chain().focus();

  const setBlock = (b: string) => {
    if (b === "p") c().setParagraph().run();
    else c().toggleHeading({ level: Number(b[1]) as 2 | 3 | 4 }).run();
  };

  const link = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("الرابط (اتركه فارغاً لإزالته)", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") c().extendMarkRange("link").unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/admin/rich-media", {
        method: "POST", body, credentials: "same-origin",
        headers: { Accept: "application/json", "X-XSRF-TOKEN": xsrf(), "X-Requested-With": "XMLHttpRequest" },
      });
      if (!res.ok) throw new Error(String(res.status));
      const { url } = (await res.json()) as { url: string };
      const alt = window.prompt("وصف الصورة (بلا اسم مكان أو حيّ)", "") ?? "";
      c().setImage({ src: url, alt }).run();
    } catch {
      window.alert("تعذّر رفع الصورة. تأكّد أنها JPG أو PNG أو WebP وأقلّ من 8MB.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-rule bg-rule/20 p-1.5" dir="rtl">
      <Group>
        <Btn label="تراجع" onClick={() => c().undo().run()} disabled={!s.canUndo}>↶</Btn>
        <Btn label="إعادة" onClick={() => c().redo().run()} disabled={!s.canRedo}>↷</Btn>
      </Group>
      <Group>
        <Pick label="نوع الفقرة" value={s.block} onChange={setBlock}
          options={[["p", "فقرة"], ["h2", "عنوان ١"], ["h3", "عنوان ٢"], ["h4", "عنوان ٣"]]} />
        <Pick label="الخطّ" value={s.font} onChange={(v) => (v ? c().setFontFamily(v).run() : c().unsetFontFamily().run())}
          options={FONTS.map((f) => [f.v, f.name])} />
        <Pick label="الحجم" value={s.size} onChange={(v) => (v ? c().setFontSize(v).run() : c().unsetFontSize().run())}
          options={SIZES.map((z) => [z, z ? z.replace("px", "") : "الحجم"])} />
        <Pick label="تباعد الأسطر" value={s.lineHeight} onChange={(v) => (v ? c().setLineHeight(v).run() : c().unsetLineHeight().run())}
          options={LINE_HEIGHTS.map((h) => [h, h || "التباعد"])} />
      </Group>
      <Group>
        <Btn label="عريض" on={s.bold} onClick={() => c().toggleBold().run()}><b>B</b></Btn>
        <Btn label="مائل" on={s.italic} onClick={() => c().toggleItalic().run()}><i>I</i></Btn>
        <Btn label="تسطير" on={s.underline} onClick={() => c().toggleUnderline().run()}><u>U</u></Btn>
        <Btn label="يتوسّطه خط" on={s.strike} onClick={() => c().toggleStrike().run()}><s>S</s></Btn>
        <Btn label="منخفض" on={s.sub} onClick={() => c().toggleSubscript().run()}>x₂</Btn>
        <Btn label="مرتفع" on={s.sup} onClick={() => c().toggleSuperscript().run()}>x²</Btn>
      </Group>
      <Group>
        {COLORS.map((col) => (
          <button key={col.v} type="button" title={`لون النصّ: ${col.name}`} aria-label={`لون النصّ: ${col.name}`}
            aria-pressed={s.color === col.v} onClick={() => c().setColor(col.v).run()}
            className={`size-6 rounded-full border-2 ${s.color === col.v ? "border-ink" : "border-paper"} shadow-[0_0_0_1px_var(--color-rule)]`}
            style={{ background: col.v }} />
        ))}
        <Btn label="إزالة اللون" onClick={() => c().unsetColor().run()}>⌀</Btn>
        <Btn label="تظليل" on={s.mark} onClick={() => c().toggleHighlight({ color: MARK }).run()}>
          <span className="rounded px-1" style={{ background: MARK }}>ab</span>
        </Btn>
      </Group>
      <Group>
        <Btn label="محاذاة لليمين" on={s.align === "right"} onClick={() => c().setTextAlign("right").run()}>⇥</Btn>
        <Btn label="توسيط" on={s.align === "center"} onClick={() => c().setTextAlign("center").run()}>≡</Btn>
        <Btn label="محاذاة لليسار" on={s.align === "left"} onClick={() => c().setTextAlign("left").run()}>⇤</Btn>
        <Btn label="ضبط" on={s.align === "justify"} onClick={() => c().setTextAlign("justify").run()}>☰</Btn>
      </Group>
      <Group>
        <Btn label="قائمة نقطية" on={s.bullet} onClick={() => c().toggleBulletList().run()}>•≡</Btn>
        <Btn label="قائمة مرقّمة" on={s.ordered} onClick={() => c().toggleOrderedList().run()}>1.</Btn>
        <Btn label="اقتباس" on={s.quote} onClick={() => c().toggleBlockquote().run()}>❝</Btn>
        <Btn label="خطّ فاصل" onClick={() => c().setHorizontalRule().run()}>―</Btn>
      </Group>
      <Group>
        <Btn label="رابط" on={s.link} onClick={link}>🔗</Btn>
        <Btn label={uploading ? "جارٍ الرفع…" : "صورة"} disabled={uploading} onClick={() => fileRef.current?.click()}>🖼</Btn>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
          onChange={(ev) => { const f = ev.target.files?.[0]; if (f) void upload(f); }} />
        <Btn label="إدراج جدول" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>⊞</Btn>
      </Group>
      {s.table && (
        <Group>
          <Btn label="صفّ بعده" onClick={() => c().addRowAfter().run()}>+صف</Btn>
          <Btn label="عمود بعده" onClick={() => c().addColumnAfter().run()}>+عمود</Btn>
          <Btn label="حذف الصف" onClick={() => c().deleteRow().run()}>−صف</Btn>
          <Btn label="حذف العمود" onClick={() => c().deleteColumn().run()}>−عمود</Btn>
          <Btn label="دمج/فصل الخلايا" onClick={() => c().mergeOrSplit().run()}>⊡</Btn>
          <Btn label="صفّ ترويسة" onClick={() => c().toggleHeaderRow().run()}>ترويسة</Btn>
          <Btn label="حذف الجدول" onClick={() => c().deleteTable().run()}>✕</Btn>
        </Group>
      )}
      <Group>
        <Btn label="مسح التنسيق" onClick={() => c().unsetAllMarks().clearNodes().run()}>Tx</Btn>
      </Group>
    </div>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5 border-e border-rule pe-1 last:border-e-0">{children}</div>;
}

function Btn({ label, on = false, disabled = false, onClick, children }: {
  label: string; on?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode;
}) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={on} disabled={disabled}
      onMouseDown={(e) => e.preventDefault() /* يبقى التحديد في المحرّر */}
      onClick={onClick}
      className={`inline-grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm transition disabled:opacity-35 ${on ? "bg-green text-paper" : "text-ink hover:bg-paper"}`}>
      {children}
    </button>
  );
}

function Pick({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <select aria-label={label} title={label} value={value} onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-rule bg-paper px-1.5 text-sm">
      {options.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
    </select>
  );
}
