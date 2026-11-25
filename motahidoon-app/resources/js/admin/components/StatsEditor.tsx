import type { Stat } from "@/types";
import { Repeater } from "./Repeater";
import { Button, TextField } from "./ui";

export type StatRow = { value: string; unit: string };

/**
 * بطاقات الأرقام: الرقم كبيراً والوصف تحته. القائمة الفارغة = تلقائي — يستخرج
 * الموقع أوّل رقم في كلّ بند مع الكلمة بعده (تُعرض هنا معاينةً). التحرير
 * يبدأ من تلك البطاقات نفسها، والقيمة تُكتب كما في النصّ حرفياً.
 */
export function StatsEditor({ value, onChange, auto, errors, prefix, hint }: {
  value: StatRow[];
  onChange: (rows: StatRow[]) => void;
  /** ما يرسمه الموقع تلقائياً حين لا تُحرَّر البطاقات */
  auto: Stat[];
  errors: Record<string, string | undefined>;
  prefix: string;
  hint?: string;
}) {
  if (value.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-rule bg-paper p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold">
            تلقائية <span className="font-normal text-ink/60">— تُستخرج من النصّ: أوّل رقم في كلّ بند والكلمة بعده.</span>
          </p>
          <Button type="button" variant="secondary" size="sm"
            onClick={() => onChange(auto.length ? auto.map((s) => ({ ...s })) : [{ value: "", unit: "" }])}>
            {auto.length ? "تعديل البطاقات" : "إضافة بطاقات"}
          </Button>
        </div>
        {auto.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {auto.map((s, i) => (
              <li key={i} className="border border-rule bg-white px-3 py-2">
                <span dir="ltr" className="block text-base font-black leading-tight">{s.value}</span>
                <span className="block text-xs text-ink/60">{s.unit}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-ink/60">لا أرقام تُستخرج من النصّ الحالي، فلا بطاقات تظهر.</p>
        )}
        {hint && <p className="mt-3 text-xs leading-5 text-ink/60">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold">
          محرَّرة يدوياً <span className="font-normal text-ink/60">— تظهر هذه البطاقات بدل المستخرجة تلقائياً.</span>
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>العودة إلى التلقائي</Button>
      </div>
      <Repeater<StatRow> compact items={value} onChange={onChange} addLabel="بطاقة"
        make={() => ({ value: "", unit: "" })}
        render={(s, update, i) => (
          <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
            <TextField label="الرقم" dir="ltr" value={s.value} onChange={(v) => update({ value: v })}
              error={errors[`${prefix}.${i}.value`]} hint="كما في النصّ، مثل 152,607" />
            <TextField label="الوصف تحت الرقم" value={s.unit} onChange={(v) => update({ unit: v })}
              error={errors[`${prefix}.${i}.unit`]} hint="مثل: إجمالي الإيرادات" />
          </div>
        )} />
      {hint && <p className="text-xs leading-5 text-ink/60">{hint}</p>}
    </div>
  );
}
