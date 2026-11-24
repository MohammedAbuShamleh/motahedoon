/* النصّ المنسَّق: القاعدة نفسها في الخادم (App\Services\Content\RichText::isHtml)
   — غيّرهما معاً. القيمة التي لا تبدأ بوسم كتلة نصٌّ عادي يُرسَم نصّاً
   ويُهرَّب كالمعتاد؛ وما يبدأ به مرّ على منقّي الخادم قبل الحفظ وعند البناء. */
const HTML_START = /^\s*<(p|h[1-6]|ul|ol|blockquote|table|div|figure|img|hr|pre)[\s>/]/i;

export const isHtml = (v: string | null | undefined): boolean => !!v && HTML_START.test(v);

/** النصّ وحده بلا وسوم — للمعاينات المختصرة واستخراج الأرقام. */
export function plainText(v: string | null | undefined): string {
  if (!v) return "";
  if (!isHtml(v)) return v;
  const doc = new DOMParser().parseFromString(v, "text/html");
  // فاصل بين الكتل: <p>أ</p><p>ب</p> لا تُلصق «أب»
  doc.body.querySelectorAll("p,h2,h3,h4,li,blockquote,td,th,br").forEach((el) => el.append(" "));
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

/* الأرقام بالأخضر داخل النصّ المنسَّق: الحكم نفسه في <Nums>، يغلّف ولا يعيد
   التنسيق. يمرّ على عقد النصّ وحدها فلا يمسّ سمات الروابط والصور. */
const RUN = /(\d[\d,،.]*\d|\d)/g;

export function numify(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);

  for (const node of texts) {
    const text = node.data;
    RUN.lastIndex = 0;
    if (!RUN.test(text)) continue;
    const frag = doc.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(RUN)) {
      const i = m.index ?? 0;
      if (i > last) frag.append(text.slice(last, i));
      const span = doc.createElement("span");
      span.className = "num";
      span.textContent = m[0];
      frag.append(span);
      last = i + m[0].length;
    }
    if (last < text.length) frag.append(text.slice(last));
    node.replaceWith(frag);
  }
  return doc.body.innerHTML;
}
