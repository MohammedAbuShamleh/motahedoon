/* عدّاد مسرح «مجالات العمل» — ترقيم واجهة، لا رقم من المحتوى. */

const ord = (n: number) => String(n).padStart(2, "0");

/** العدّاد: الرقم الحالي يصعد من خلف سطره عند كلّ تبديل، والمجموع خافت.
    ترقيم واجهة (موضع الشريحة)، لا رقم من المحتوى. */
export function SpotCount({ index, total }: { index: number; total: number }) {
  return (
    <p className="spot__count" aria-hidden="true">
      <span className="spot__now"><b key={index}>{ord(index + 1)}</b></span>
      <span className="spot__of">/ {ord(total)}</span>
    </p>
  );
}

