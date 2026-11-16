/* تلوين الأرقام داخل النص بالأخضر — لغة بصرية قائمة في الهوية.
   لا يغيّر النص ولا يعيد تنسيق الرقم، يغلّفه فقط.
   نقل حرفي لـ nums() في app.js. */
const RUN = /(\d[\d,،.]*\d|\d)/g;

export function Nums({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(RUN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    out.push(<span className="num" key={k++}>{m[0]}</span>);
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
