/* أيقونات المجالات — خطية هندسية داخل معيّن الشعار.
   لا تجسيد لذوات الأرواح: المعيّن والخطوط وحدها.
   مجال بلا أيقونة لا يكسر شيئاً — تُعرض بقية العناصر فقط.

   وُلِّدت أصلاً آلياً من app.js الثابت، ثم عُدّلت يدوياً: نقطة «الإعلام»
   صارت معيّناً بدل الدائرة (لا دوائر في الهوية — 2026-11-19). */

interface IconPath { cls: string; transform?: string; d: string }

const ICONS: Record<string, IconPath[]> = {
  dawah: [
    { cls: "ico__f", d: "M24 3 L45 24 L24 45 L3 24 Z" },
    { cls: "ico__g", transform: "translate(24,24) scale(1.2) translate(-24,-24)", d: "M15 19 L24 22 L33 19 M15 19 L15 29 L24 32 L33 29 L33 19 M24 22 L24 32" },
  ],
  quran: [
    { cls: "ico__f", d: "M24 3 L45 24 L24 45 L3 24 Z" },
    { cls: "ico__g", transform: "translate(24,24) scale(1.2) translate(-24,-24)", d: "M17 16 L17 32 L31 32 L31 16 Z M20.5 16 L20.5 32 M25.8 21 L28.6 24 L25.8 27 L23 24 Z" },
  ],
  relief: [
    { cls: "ico__f", d: "M24 3 L45 24 L24 45 L3 24 Z" },
    { cls: "ico__g", transform: "translate(24,24) scale(1.2) translate(-24,-24)", d: "M15 20 L33 20 L33 31 L15 31 Z M15 24 L33 24 M24 20 L24 31" },
  ],
  education: [
    { cls: "ico__f", d: "M24 3 L45 24 L24 45 L3 24 Z" },
    { cls: "ico__g", transform: "translate(24,24) scale(1.2) translate(-24,-24)", d: "M14 23 L24 17 L34 23 M17 23 L17 31 M21.7 23 L21.7 31 M26.3 23 L26.3 31 M31 23 L31 31 M15 31 L33 31" },
  ],
  women: [
    { cls: "ico__f", d: "M24 3 L45 24 L24 45 L3 24 Z" },
    { cls: "ico__g", transform: "translate(24,24) scale(1.2) translate(-24,-24)", d: "M14 25 L24 16.5 L34 25 M16.8 25 L16.8 32 L31.2 32 L31.2 25 M21 32 L21 26.8 L27 26.8 L27 32" },
  ],
  media: [
    { cls: "ico__f", d: "M24 3 L45 24 L24 45 L3 24 Z" },
    { cls: "ico__g", transform: "translate(24,24) scale(1.2) translate(-24,-24)", d: "M24 21.2 L26.8 24 L24 26.8 L21.2 24 Z M18.5 18.5 A8 8 0 0 0 18.5 29.5 M29.5 18.5 A8 8 0 0 1 29.5 29.5 M14.5 14.5 A14 14 0 0 0 14.5 33.5 M33.5 14.5 A14 14 0 0 1 33.5 33.5" },
  ],
  health: [
    { cls: "ico__f", d: "M24 3 L45 24 L24 45 L3 24 Z" },
    { cls: "ico__g", transform: "translate(24,24) scale(1.2) translate(-24,-24)", d: "M21 16 L27 16 L27 21 L32 21 L32 27 L27 27 L27 32 L21 32 L21 27 L16 27 L16 21 L21 21 Z" },
  ],
};

export function Icon({ id }: { id: string }) {
  const paths = ICONS[id];
  if (!paths) return null;
  return (
    <svg className="ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {paths.map((p, i) => (
        <path key={i} className={p.cls} transform={p.transform} d={p.d} />
      ))}
    </svg>
  );
}
