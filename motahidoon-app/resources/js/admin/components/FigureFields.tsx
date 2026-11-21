import type { FigureRow } from "../types";
import { TextField, Toggle } from "./ui";

/** رقم (مؤشّر أو رقم كتلة). القيمة تُكتب كما في المصدر حرفياً — لا تُحسب ولا تُقرَّب. */
export function FigureFields({ row, update, errors, prefix }: {
  row: FigureRow;
  update: (p: Partial<FigureRow>) => void;
  errors: Record<string, string | undefined>;
  prefix: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <TextField label="القيمة" hint="كما في المصدر تماماً، مثل 12,013,597" dir="ltr" value={row.value} onChange={(v) => update({ value: v })} error={errors[`${prefix}.value`]} />
      <TextField label="رمز قبل الرقم" hint="مثل $" dir="ltr" value={row.prefix ?? ""} onChange={(v) => update({ prefix: v })} />
      <TextField label="الوحدة" hint="مثل: مستفيد" value={row.unit ?? ""} onChange={(v) => update({ unit: v })} />
      <div className="flex items-end pb-2">
        <Toggle label="إبراز الرقم" checked={row.accent} onChange={(v) => update({ accent: v })} />
      </div>
      <TextField className="sm:col-span-4" label="وصف الرقم" value={row.label} onChange={(v) => update({ label: v })} error={errors[`${prefix}.label`]} />
    </div>
  );
}

export const newFigure = (): FigureRow => ({ value: "", prefix: "", unit: "", label: "", accent: false });
