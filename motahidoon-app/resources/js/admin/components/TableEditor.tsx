import type { TableData } from "../types";
import { Glyph } from "./icons";
import { Button, TextField } from "./ui";

/** محرّر جدول: رأس، صفوف، وتذييل اختياري. القيم نصوص كما تُكتب — بلا حساب. */
export function TableEditor({ value, onChange }: { value: TableData | null; onChange: (t: TableData | null) => void }) {
  if (value === null) {
    return (
      <Button variant="secondary" onClick={() => onChange({ title: "", head: ["", ""], rows: [["", ""]], foot: null, foot_note: "" })}>
        + إضافة جدول
      </Button>
    );
  }

  const width = value.head.length;
  const cell = "h-9 w-full min-w-24 rounded-md border border-rule bg-paper px-2.5 text-sm outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/15";
  const setRow = (r: number, c: number, v: string) =>
    onChange({ ...value, rows: value.rows.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)) });

  return (
    <div className="space-y-3">
      <TextField label="عنوان الجدول" value={value.title ?? ""} onChange={(v) => onChange({ ...value, title: v })} />
      <div className="overflow-x-auto rounded-lg border border-rule">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-rule/50">
            <tr>
              {value.head.map((h, c) => (
                <th key={c} className="p-1.5">
                  <input className={`${cell} font-bold`} value={h} onChange={(e) => onChange({ ...value, head: value.head.map((x, j) => (j === c ? e.target.value : x)) })} />
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {value.rows.map((row, r) => (
              <tr key={r} className="border-t border-rule">
                {Array.from({ length: width }, (_, c) => (
                  <td key={c} className="p-1.5">
                    <input className={cell} value={row[c] ?? ""} onChange={(e) => setRow(r, c, e.target.value)} />
                  </td>
                ))}
                <td className="p-1.5">
                  <Button variant="ghost" size="icon" className="text-red" aria-label="حذف الصف" onClick={() => onChange({ ...value, rows: value.rows.filter((_, i) => i !== r) })}><Glyph name="close" className="size-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
          {value.foot && (
            <tfoot className="border-t-2 border-rule bg-rule/30">
              <tr>
                {Array.from({ length: width }, (_, c) => (
                  <td key={c} className="p-1.5">
                    <input className={`${cell} font-bold`} value={value.foot?.[c] ?? ""} onChange={(e) => onChange({ ...value, foot: Array.from({ length: width }, (_, j) => (j === c ? e.target.value : value.foot?.[j] ?? "")) })} />
                  </td>
                ))}
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => onChange({ ...value, rows: [...value.rows, Array(width).fill("")] })}>+ صف</Button>
        <Button variant="secondary" onClick={() => onChange({ ...value, head: [...value.head, ""], rows: value.rows.map((r) => [...r, ""]), foot: value.foot ? [...value.foot, ""] : null })}>+ عمود</Button>
        {width > 1 && (
          <Button variant="secondary" onClick={() => onChange({ ...value, head: value.head.slice(0, -1), rows: value.rows.map((r) => r.slice(0, width - 1)), foot: value.foot ? value.foot.slice(0, width - 1) : null })}>− آخر عمود</Button>
        )}
        <Button variant="secondary" onClick={() => onChange({ ...value, foot: value.foot ? null : Array(width).fill("") })}>
          {value.foot ? "إزالة التذييل" : "+ صف تذييل (إجمالي)"}
        </Button>
        <Button variant="danger" onClick={() => onChange(null)}>حذف الجدول</Button>
      </div>
      <TextField label="حاشية الجدول" value={value.foot_note ?? ""} onChange={(v) => onChange({ ...value, foot_note: v })} />
    </div>
  );
}
