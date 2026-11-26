import { plainText } from "./rich";
import type { Entry, Stat } from "@/types";

/* ---------- استخراج الأرقام ----------
   يلتقط أول رقم في كل بند مع وحدته **كما كُتبت**، ويعرضه بطاقةً.
   استخراج لا اشتقاق: لا جمع ولا حساب ولا تقريب، والجملة الكاملة تبقى
   كما هي أسفله. يُستعمل حين لا تُحرَّر البطاقات من اللوحة؛ واللوحة
   تستعمله لتعرض ما سيظهر تلقائياً. */
const STAT_RE = /(\d[\d,]*)\s+([^\s،.:؛()«»]+(?:\s+[^\s،.:؛()«»]+)?)/;

/* الكلمة الثانية تُلتقط لتكمل الوحدة («طالباً وطالبة»)، لكنها إن كانت حرف
   جرّ أو عطف أو صلة بقيت الوحدة معلّقة: «105 مشاركين في». تُترك الكلمة
   المعلّقة ولا يُضاف شيء — الرقم والوحدة يبقيان كما كُتبا حرفياً. */
const DANGLING = new Set([
  "في", "من", "على", "إلى", "الى", "عن", "مع", "ضمن", "خلال", "عبر", "لدى", "حتى",
  "بين", "منذ", "نحو", "حول", "عند", "و", "أو", "ثم", "التي", "الذي", "الذين", "اللاتي",
  "منها", "منهم", "منهن", "فيها", "فيه", "بها", "به", "لـ", "بـ",
]);

/* null: الرقم بلا وحدة بعده («من 317,000 في الربع الثاني» — المعدود قبله)،
   فلا بطاقة له؛ لا تُخترع وحدة، والجملة كاملة تبقى أسفل الشريط. */
function unitOf(raw: string): string | null {
  const words = raw.split(/\s+/);
  if (DANGLING.has(words[0])) return null;
  return words.length > 1 && DANGLING.has(words[words.length - 1]) ? words[0] : raw;
}

/* القيد بعد الوحدة: «639 خدمة طبية ضمن مشروع جذور». كانت البطاقة تقف عند
   «639 خدمة طبية» فتُقرأ إجمالياً للخدمات الطبية وهي جزء منها (والإجمالي
   7,567 في المتن) — تناقض ظاهر. فإن تلا الوحدةَ حرفُ جرّ أو صلة بدأ قيداً،
   يُضمّ حرفياً حتى أول فاصلة، ما دام قصيراً يتّسع للبطاقة. */
const QUALIFIER_MAX_WORDS = 4;

function qualifierAfter(rest: string): string | null {
  const phrase = rest.split(/[،,.:؛()«»\n]/)[0].trim();
  const words = phrase.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > QUALIFIER_MAX_WORDS || !DANGLING.has(words[0])) return null;
  // قيد ينتهي بحرف معلّق ليس قيداً تامّاً
  return DANGLING.has(words[words.length - 1]) ? null : phrase;
}

export function statsOf(items: Pick<Entry, "term" | "text">[]): Stat[] {
  const out: Stat[] = [];
  items.forEach((it) => {
    if (it.term) return;                 // البنود المعنونة ليست أرقاماً
    const text = plainText(it.text);     // المنسَّق يُقرأ نصّاً
    const m = STAT_RE.exec(text);
    const unit = m && m[1].length <= 12 ? unitOf(m[2]) : null;
    if (!m || !unit) return;
    // ما بعد الوحدة نفسها (لا بعد المطابقة: الوحدة المقصوصة تترك حرف الجرّ بعدها)
    const afterNum = text.slice(m.index + m[1].length).trimStart();
    const q = qualifierAfter(afterNum.slice(unit.length));
    out.push({ value: m[1], unit: q ? `${unit} ${q}` : unit });
  });
  return out;
}
