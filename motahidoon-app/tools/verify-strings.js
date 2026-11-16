/* =====================================================================
   مدقّق سلامة النصوص — بوّابة المرحلتين أ وب
   ---------------------------------------------------------------------
   يتحقّق أن مجموعة النصوص التي **تُرسَم فعلاً** مطابقة لما كان الموقع
   الثابت يرسمه. المقارنة بالموقع الأصلي لا بملف المحتوى، لأن بعض نصوص
   data.js لا تُعرض في أي صفحة أصلاً (بنود مجموعات التقارير القديمة) —
   فمقارنتها بالملف وحده تعطي «مفقوداً» ليس نقصاً.

   مَزلقان وقعتُ فيهما وصُحّحا، يُحفظان هنا لئلا يتكرّرا:

   ١. وصل العقد النصّية بفاصل يكسر المطابقة: نصّ يقطعه <em> أو
      <span class="num"> يصير جزأين. الوصل هنا **بلا فاصل**.

   ٢. document.body.textContent يشمل نصّ <script>. وInertia 2 يضع حمولة
      الصفحة في وسم script داخل body (145 ألف حرف) — فيقرأ المدقّق
      الحمولة ويمرّ كاذباً. هنا تُستبعد script وstyle وnoscript صراحة.

   الاستعمال — يُلصق في طرفية المتصفّح داخل الموقع، ثم:

     await verifyAll("http://localhost:8130", APP_ROUTES)   // النسخة الجديدة
     await verifyAll("http://localhost:8123", STATIC_ROUTES) // الأصل

   يُقارَن الناتجان بالبصمة. تطابُقها = الترحيل سليم.
   ملاحظة: الإطار الداخلي يخضع لسياسة الأصل الواحد، فشغّل كلاً من داخل
   موقعه (المنفذ جزء من الأصل).
   ===================================================================== */

const APP_ROUTES = [
  "/", "/about", "/reports", "/reports/q2-2026",
  "/p/dawah", "/p/quran", "/p/relief", "/p/education",
  "/p/women", "/p/media", "/p/health",
];

const STATIC_ROUTES = [
  "/index.html", "/pillar.html?id=about", "/pillar.html?id=report",
  "/pillar.html?id=q2-2026", "/pillar.html?id=dawah", "/pillar.html?id=quran",
  "/pillar.html?id=relief", "/pillar.html?id=education",
  "/pillar.html?id=women", "/pillar.html?id=media", "/pillar.html?id=health",
];

function harvest(d) {
  const w = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
  let t = "";
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const p = n.parentElement;
    if (!p || p.closest("script,style,noscript")) continue;
    t += n.textContent || "";          // بلا فاصل: النصّ المقطوع يُطابَق
  }
  d.querySelectorAll("[alt],[aria-label],[title]").forEach((e) => {
    t += "\n" + (e.getAttribute("alt") || "")
       + "\n" + (e.getAttribute("aria-label") || "")
       + "\n" + (e.getAttribute("title") || "");
  });
  return t.replace(/\s+/g, " ");
}

async function verifyAll(origin, routes, content) {
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;left:-9999px;width:1280px;height:900px;border:0";
  document.body.appendChild(f);

  let hay = "";
  for (const r of routes) {
    await new Promise((ok) => { f.onload = ok; f.src = origin + r; });
    await new Promise((ok) => setTimeout(ok, 1100));
    const d = f.contentDocument;
    d.querySelectorAll("details").forEach((x) => { x.open = true; });
    d.querySelectorAll(".reveal").forEach((x) => x.classList.add("is-in"));
    await new Promise((ok) => setTimeout(ok, 120));
    hay += " " + harvest(d);
  }
  f.remove();

  const site = content ?? await (await fetch("/__content.json")).json();

  /* المسارات والمُعرّفات ليست نصوصاً معروضة */
  const ASSET = /^assets\//i;
  const ID = /^[a-z0-9][a-z0-9_.-]*$/i;
  const wanted = new Set();
  (function walk(n) {
    if (typeof n === "string") {
      const t = n.trim();
      if (t && !ASSET.test(t) && !ID.test(t)) wanted.add(t);
    } else if (Array.isArray(n)) n.forEach(walk);
    else if (n && typeof n === "object") Object.values(n).forEach(walk);
  })(site);

  const missing = [...wanted].filter((s) => !hay.includes(s.replace(/\s+/g, " ")));
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(missing.slice().sort().join("\u0001")),
  );
  const fingerprint = [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);

  return { chars: hay.length, checked: wanted.size, missing: missing.length, fingerprint, missingList: missing };
}

Object.assign(globalThis, { verifyAll, harvest, APP_ROUTES, STATIC_ROUTES });

/* النتيجة المسجَّلة في 2026-11-16، المرحلة أ:
     الثابت  : 521 مفحوصاً · 93 غير معروض · 6e47f8d382e1089a4f8fa80770804fc5
     Inertia : 521 مفحوصاً · 93 غير معروض · 6e47f8d382e1089a4f8fa80770804fc5
   تطابق تامّ — مجموعة النصوص المرسومة واحدة.

   الـ93 ليست نقصاً في الترحيل: بنود مجموعات تقرير الربع الثاني لا تُرسَم
   في أي من النسختين، لأن صفحة المجال تعرض أحدث تقرير يذكره فقط، وصفحة
   التقرير تعرض موجزاً لا تفصيلاً. ثغرة تصميم قائمة في الأصل، تُحسم في
   لوحة التحكم لا هنا. */
