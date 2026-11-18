import type { ReactNode } from "react";
import { Button } from "./ui";

/**
 * محرّر قائمة مرتّبة: إضافة، حذف، تحريك لأعلى ولأسفل.
 * الترتيب المرئي هو الترتيب المحفوظ (position) — يُرسل كاملاً ويزامنه
 * SyncsChildren في الخادم.
 */
export function Repeater<T>({ items, onChange, make, render, addLabel = "إضافة", empty = "لا عناصر بعد.", compact = false }: {
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
      {items.length === 0 && <p className="text-sm text-ink/55">{empty}</p>}
      {items.map((item, i) => (
        <div key={i} className={`relative rounded-lg border border-rule bg-paper ${compact ? "p-3" : "p-4"}`}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-olive">#{i + 1}</span>
            <div className="flex gap-1">
              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => move(i, -1)} disabled={i === 0} aria-label="تحريك لأعلى">▲</Button>
              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="تحريك لأسفل">▼</Button>
              <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => onChange(items.filter((_, k) => k !== i))}>حذف</Button>
            </div>
          </div>
          {render(item, (patch) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      <Button variant="secondary" onClick={() => onChange([...items, make()])}>+ {addLabel}</Button>
    </div>
  );
}
