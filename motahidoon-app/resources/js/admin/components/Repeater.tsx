import type { ReactNode } from "react";
import { Glyph } from "./icons";
import { Button, IndexChip } from "./ui";

/**
 * محرّر قائمة مرتّبة: إضافة، حذف، تحريك لأعلى ولأسفل.
 * الترتيب المرئي هو الترتيب المحفوظ (position) — يُرسل كاملاً ويزامنه
 * SyncsChildren في الخادم. العنصر على أرضية مصبوغة خفيفاً ليتميّز عن البطاقة.
 */
export function Repeater<T>({ items, onChange, make, render, addLabel = "عنصر", empty = "لا عناصر بعد.", compact = false }: {
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel?: string;
  empty?: string;
  compact?: boolean;
}) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="rounded-lg border border-dashed border-rule px-4 py-3 text-sm text-ink/55">{empty}</p>}
      {items.map((item, i) => (
        <div key={i} className={`relative rounded-lg border border-rule bg-rule/15 ${compact ? "p-3" : "p-4"}`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <IndexChip>{i + 1}</IndexChip>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="تحريك لأعلى"><Glyph name="up" className="size-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="تحريك لأسفل"><Glyph name="down" className="size-4" /></Button>
              <Button variant="danger" size="sm" onClick={() => onChange(items.filter((_, k) => k !== i))}>حذف</Button>
            </div>
          </div>
          {render(item, (patch) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      <Button variant="secondary" onClick={() => onChange([...items, make()])}>+ إضافة {addLabel}</Button>
    </div>
  );
}
