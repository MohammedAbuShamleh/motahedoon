/* أدوات العارض المشتركة («من الميدان»، وعدّاد مسرح «مجالات العمل») —
   مربّعات ليّنة لا دوائر (قرار الهوية). الأسهم مرسومة للعربية وتُعكس في
   اللاتينية بـCSS. */

const ord = (n: number) => String(n).padStart(2, "0");

/** سهما التنقّل: السابق مفرَّغ والتالي ممتلئ — الأثقل هو اتّجاه القراءة. */
export function SpotArrows({ onBack, onNext, backLabel, nextLabel }: {
  onBack: () => void; onNext: () => void; backLabel: string; nextLabel: string;
}) {
  return (
    <div className="spot__nav">
      <button type="button" className="spot__btn" aria-label={backLabel} onClick={onBack}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button type="button" className="spot__btn spot__btn--fwd" aria-label={nextLabel} onClick={onNext}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
    </div>
  );
}

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

