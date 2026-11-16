/* =====================================================================
   تجمع متحدون من أجل غزة — بناء الصفحات من SITE (data.js)
   ---------------------------------------------------------------------
   المعمار: «المتن والحاشية».
     sheet__main   = المتن   → المؤسسة الدائمة. ممنوع أن يظهر فيه تاريخ.
     sheet__aside  = الحاشية → ترقيم القسم، الحقول الناقصة، ختم الفترة.
   القاعدة: كل قسم محتواه مرتبط بفترة يحمل seal() في حاشيته. وبدونه فمحتواه دائم.

   المحتوى المؤرَّخ كله يعيش في S.reports.items[]، وكل تقرير مكتفٍ بذاته.
   صفحة المجال تعرض تعريفه الدائم، ثم حصيلته في أحدث تقرير يذكره.

   لا يوجد نص ثابت هنا سوى تسميات الواجهة. كل المحتوى من data.js.
   لا يُخترع نص لحقل ناقص: الحقل الفارغ يُعرض بـ slot() كخانة محجوزة معلَّمة.
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- أدوات ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // تلوين الأرقام داخل النص بالأخضر — لغة بصرية قائمة في الهوية.
  // لا يغيّر النص ولا يعيد تنسيق الرقم، يغلّفه فقط.
  const nums = (s) => esc(s).replace(/(\d[\d,،.]*\d|\d)/g, '<span class="num">$1</span>');

  /* ---------- اللغات ----------
     data.js عربي خالص ولا يُمس. الترجمات ملفات منفصلة تُدمج هنا وقت التشغيل.
     كل ما لم يُترجم بعد لا يُعرض بالعربية داخل صفحة أجنبية، بل يُشار إليه برابط. */
  const LANGS = {
    ar: { code: "ar", dir: "rtl", name: "العربية" },
    en: { code: "en", dir: "ltr", name: "English" },
    tr: { code: "tr", dir: "ltr", name: "Türkçe" }
  };

  const QS = new URLSearchParams(location.search);
  function pickLang() {
    const q = QS.get("lang");
    if (q && LANGS[q]) { try { localStorage.setItem("lang", q); } catch (e) {} return q; }
    try { const v = localStorage.getItem("lang"); if (v && LANGS[v]) return v; } catch (e) {}
    return "ar";
  }
  let LANG = pickLang();
  let T = (window.I18N && window.I18N[LANG]) || null;
  // إن لم يُحمَّل ملف اللغة، لا تُعرض صفحة نصفها عربي: ارجع للعربية كاملة.
  if (LANG !== "ar" && !T) LANG = "ar";
  const IS_AR = LANG === "ar";

  // الترجمة بمفتاح عربي: لا مفاتيح مخترعة، والعربية هي الافتراضي دائماً.
  const U = (k) => (T && T.ui && T.ui[k]) || k;

  // رابط يحافظ على اللغة الحالية
  const url = (id, lang) => {
    const l = lang || LANG;
    return `pillar.html?id=${encodeURIComponent(id)}` + (l === "ar" ? "" : `&lang=${l}`);
  };
  const homeUrl = (lang) => {
    const l = lang || LANG;
    return "index.html" + (l === "ar" ? "" : `?lang=${l}`);
  };
  const PENDING = U("بانتظار اعتماد التجمع");

  /* ---------- بناء نسخة اللغة ----------
     ما لا ترجمة له يُحذف من العرض ويُعلَّم untranslated، فلا تختلط اللغات. */
  function localize(site) {
    if (!T) return site;
    const S = JSON.parse(JSON.stringify(site));

    if (T.org) Object.assign(S.org, T.org);
    if (T.mediaOffice) S.mediaOffice = T.mediaOffice;
    if (T.intro) S.intro = T.intro;
    if (T.founding && T.founding.story) S.founding.story = T.founding.story;
    if (T.identity) Object.assign(S.identity, T.identity);
    if (T.goals) S.goals = T.goals;
    if (T.aspirations) S.aspirations = T.aspirations;
    if (T.governance) S.governance = T.governance;

    S.partners.forEach((p) => {
      if (T.partners && T.partners[p.id]) p.name = T.partners[p.id];
    });
    S.pillars.forEach((p) => {
      const t = T.pillars && T.pillars[p.id];
      if (t) Object.assign(p, t);
      // تعليق الصورة: المترجم إن وُجد، وإلا تسمية عامة — لا نص عربي في صفحة أجنبية.
      if (p.cover) {
        p.cover = Object.assign({}, p.cover, {
          caption: (t && t.coverCaption) || U("من الميدان")
        });
      }
    });

    (S.reports.items || []).forEach((r) => {
      const t = T.reports && T.reports[r.id];
      // الأقسام السردية الطويلة لم تُترجم بعد: تُحذف من العرض الأجنبي.
      r.summary = r.appeal = r.reading = null;
      r.dataNotes = r.opportunities = r.closing = null;
      r.highlights = r.notice = null;
      if (!t) { r.untranslated = true; r.sections = {}; return; }
      ["label", "range", "reportTitle", "metricsTitle"].forEach((k) => {
        if (t[k]) r[k] = t[k];
      });
      if (t.intro) r.intro = t.intro;
      if (t.metrics) r.metrics = r.metrics.map((m, i) =>
        Object.assign({}, m, t.metrics[i] || {}));
      Object.keys(r.sections || {}).forEach((id) => {
        const ts = t.sections && t.sections[id];
        const sec = r.sections[id];
        if (!ts) { delete r.sections[id]; return; }
        if (ts.lead) sec.lead = ts.lead;
        sec.stats = ts.stats || null;     // أرقام مترجمة الوحدات
        sec.groups = []; sec.blocks = null; sec.table = null; sec.gallery = null;
        sec.untranslated = true;          // التفصيل الكامل بالعربية
      });
    });
    return S;
  }

  const S = localize(SITE);   // SITE الأصلي عربي ولا يُمس

  /* ---------- الأرشيف ---------- */
  const REPORTS = (S.reports && S.reports.items) || [];
  const reportById = (id) => REPORTS.find((r) => r.id === id) || null;
  const CURRENT = reportById(S.reports && S.reports.current) || REPORTS[0] || null;

  // أحدث تقرير يذكر هذا المجال — المجالات لا تظهر كلها في كل فترة.
  const latestFor = (pillarId) =>
    REPORTS.find((r) => r.sections && r.sections[pillarId]) || null;

  const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

  /* ---------- عناصر الحاشية ---------- */

  // خانة محجوزة لحقل غير معتمد. تبدو مقصودة، وتُستبدل تلقائياً حين يُملأ الحقل.
  const slot = (label, state) => `
    <div class="slot">
      <p class="slot__label">${esc(label)}</p>
      <p class="slot__state">${esc(state || PENDING)}</p>
    </div>`;

  const filled = (label, value) => `
    <div class="slot">
      <p class="slot__label">${esc(label)}</p>
      <p class="slot__state">${esc(value)}</p>
    </div>`;

  // ختم الفترة — الموضع الوحيد الذي يجوز أن يظهر فيه تاريخ.
  const seal = (value, kicker) => `
    <p class="seal">
      <span class="seal__k">${esc(kicker || U("حصيلة فترة"))}</span>
      <span class="seal__v">${esc(value)}</span>
    </p>`;

  const mark = (n, label) => `
    <p class="mark">
      ${n ? `<span class="mark__n">${esc(n)}</span>` : ""}
      <span class="mark__t">${esc(label)}</span>
    </p>`;

  const statement = (label, value) => value
    ? `<div class="statement">
         <p class="statement__k">${esc(label)}</p>
         <p class="statement__v">${nums(value)}</p>
       </div>`
    : `<div class="sub-head">${slot(label)}</div>`;

  const fact = (value, label, isText) => `
    <div class="fact${isText ? " fact--text" : ""}">
      <span class="fact__v">${esc(value)}</span>
      <span class="fact__l">${esc(label)}</span>
    </div>`;

  /* ---------- أيقونات المجالات ----------
     خطية هندسية داخل معيّن الشعار. لا تجسيد لذوات الأرواح.
     مجال بلا أيقونة لا يكسر شيئاً: تُعرض بقية العناصر فقط. */
  const ICONS = {
    dawah: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="ico__f" d="M24 3 L45 24 L24 45 L3 24 Z"/><path class="ico__g" transform="translate(24,24) scale(1.2) translate(-24,-24)" d="M15 19 L24 22 L33 19 M15 19 L15 29 L24 32 L33 29 L33 19 M24 22 L24 32"/></svg>',
    quran: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="ico__f" d="M24 3 L45 24 L24 45 L3 24 Z"/><path class="ico__g" transform="translate(24,24) scale(1.2) translate(-24,-24)" d="M17 16 L17 32 L31 32 L31 16 Z M20.5 16 L20.5 32 M25.8 21 L28.6 24 L25.8 27 L23 24 Z"/></svg>',
    relief: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="ico__f" d="M24 3 L45 24 L24 45 L3 24 Z"/><path class="ico__g" transform="translate(24,24) scale(1.2) translate(-24,-24)" d="M15 20 L33 20 L33 31 L15 31 Z M15 24 L33 24 M24 20 L24 31"/></svg>',
    education: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="ico__f" d="M24 3 L45 24 L24 45 L3 24 Z"/><path class="ico__g" transform="translate(24,24) scale(1.2) translate(-24,-24)" d="M14 23 L24 17 L34 23 M17 23 L17 31 M21.7 23 L21.7 31 M26.3 23 L26.3 31 M31 23 L31 31 M15 31 L33 31"/></svg>',
    women: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="ico__f" d="M24 3 L45 24 L24 45 L3 24 Z"/><path class="ico__g" transform="translate(24,24) scale(1.2) translate(-24,-24)" d="M14 25 L24 16.5 L34 25 M16.8 25 L16.8 32 L31.2 32 L31.2 25 M21 32 L21 26.8 L27 26.8 L27 32"/></svg>',
    media: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="ico__f" d="M24 3 L45 24 L24 45 L3 24 Z"/><path class="ico__g" transform="translate(24,24) scale(1.2) translate(-24,-24)" d="M24 26.5 A2.5 2.5 0 1 0 24 21.5 A2.5 2.5 0 1 0 24 26.5 M18.5 18.5 A8 8 0 0 0 18.5 29.5 M29.5 18.5 A8 8 0 0 1 29.5 29.5 M14.5 14.5 A14 14 0 0 0 14.5 33.5 M33.5 14.5 A14 14 0 0 1 33.5 33.5"/></svg>',
    health: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="ico__f" d="M24 3 L45 24 L24 45 L3 24 Z"/><path class="ico__g" transform="translate(24,24) scale(1.2) translate(-24,-24)" d="M21 16 L27 16 L27 21 L32 21 L32 27 L27 27 L27 32 L21 32 L21 27 L16 27 L16 21 L21 21 Z"/></svg>',
  };

  const icon = (id) => ICONS[id] || "";

  /* ---------- قوالب البنية ---------- */
  // noReveal: ما يقع فوق الطية يُرسم ثابتاً، فلا يستقبل الزائر صفحة فارغة.
  const band = (o) => `
    <section class="band ${o.cls || ""}"${o.id ? ` id="${o.id}"` : ""}>
      <div class="sheet${o.noReveal ? "" : " reveal"}">
        <div class="sheet__main">${o.main}</div>
        <aside class="sheet__aside">${o.aside || ""}</aside>
      </div>
    </section>`;

  // num: رقم يجلس في مربع ورقي يقطع حافة الصورة — الهندسة تمسك الورق بالميدان
  const plate = (src, caption, olive, pos, num) => `
    <figure class="band band--flush band--noline plate${olive ? " plate--olive" : ""}${
      num ? " plate--numbered" : ""}">
      ${num ? `<span class="plate__num" aria-hidden="true">${esc(num)}</span>` : ""}
      <img class="plate__img" src="${src}" alt="${esc(caption)}"${
        pos ? ` style="--plate-pos:${pos}"` : ""}>
      <figcaption>${esc(caption)}</figcaption>
    </figure>`;

  // شريط صور ميدانية — صور كبيرة، تمرير أفقي، بلا تعليق لكل صورة.
  // حاوية تمرير يمكن بلوغها بلوحة المفاتيح، ومرنة لأي عدد صور.
  function filmstrip() {
    const ph = S.fieldPhotos || [];
    if (!ph.length) return "";
    return `
      <section class="band band--tight film" id="field">
        <div class="sheet">
          <div class="sheet__main">
            <h2 class="h-sec">${esc(U("من الميدان"))}</h2>
          </div>
          <aside class="sheet__aside">
            ${mark("", U("توثيق"))}
            <div class="facts">${fact(String(ph.length), U("صور معتمدة"))}</div>
          </aside>
        </div>
        <div class="film__strip" tabindex="0" role="group"
             aria-label="${esc(U("من الميدان"))}">
          ${ph.map((src) => `
            <figure class="film__f">
              <img src="${src}" alt="${esc(U("من التوثيق الميداني للتجمع"))}" loading="lazy">
            </figure>`).join("")}
        </div>
      </section>`;
  }

  /* ---------- الترويسة ---------- */
  function header(active) {
    const links = [
      { href: active === "home" ? "#about"    : homeUrl() + "#about",    label: U("من نحن") },
      { href: active === "home" ? "#partners" : homeUrl() + "#partners", label: U("المؤسسات الشريكة") },
      { href: active === "home" ? "#fields"   : homeUrl() + "#fields",   label: U("مجالات العمل") },
      { href: url("report"), label: U("الإنجازات"), key: "report" },
      { href: active === "home" ? "#support"  : homeUrl() + "#support",  label: U("الدعم والتواصل") }
    ];
    const banner = (T && T.unapproved) ? `
      <p class="xbanner" role="note">${esc(T.unapproved)}</p>` : "";
    return `
      <a class="skip" href="#main">${esc(U("تخطَّ إلى المحتوى"))}</a>
      ${banner}
      <header class="site-header">
        <div class="site-header__in">
          <a class="brand" href="${homeUrl()}">
            <img src="${S.org.logoMark}" alt="">
            <span>
              <span class="brand__n">${esc(S.org.shortName)}</span>
              <span class="brand__s">${esc(S.org.name)}</span>
            </span>
          </a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav">${esc(U("القائمة"))}</button>
          <nav class="nav" id="nav" aria-label="${esc(U("التنقل الرئيسي"))}">
            ${links.map((l) => `<a class="nav__a" href="${l.href}"${
              l.key && l.key === active ? ' aria-current="page"' : ""
            }>${esc(l.label)}</a>`).join("")}
            <span class="langs" role="group" aria-label="${esc(U("اللغة"))}">
              ${Object.keys(LANGS).map((k) => {
                const q = new URLSearchParams(location.search);
                q.set("lang", k);   // العربية أيضاً: الاختيار يُسجَّل ولا يُترك للذاكرة
                const qs = q.toString();
                const page = location.pathname.split("/").pop() || "index.html";
                return `<a class="langs__a${k === LANG ? " is-on" : ""}" hreflang="${k}" lang="${k}"
                           href="${page}${qs ? "?" + qs : ""}"${
                           k === LANG ? ' aria-current="true"' : ""}>${esc(LANGS[k].name)}</a>`;
              }).join("")}
            </span>
          </nav>
        </div>
      </header>`;
  }

  /* ---------- التذييل ---------- */
  function footer() {
    const c = S.contact;
    const pending = (v, label) => v
      ? `<li>${esc(v)}</li>`
      : `<li class="footer__pending">${esc(label)} — ${esc(PENDING)}</li>`;
    const social = Object.entries(c.social).filter(([, v]) => v);

    return `
      <footer class="site-footer">
        <div class="site-footer__in">
          <div class="footer__top">
            <div>
              <span class="footer__logo"><img src="${S.org.logoFull}" alt="${esc(S.org.name)}"></span>
              <p class="footer__h">${esc(S.mediaOffice)}</p>
            </div>
            <div>
              <h2 class="footer__h">${esc(U("مجالات العمل"))}</h2>
              <ul class="footer__list">${S.pillars.map((p) =>
                `<li><a href="${url(p.id)}">${esc(p.short)}</a></li>`).join("")}</ul>
            </div>
            <div>
              <h2 class="footer__h">${esc(U("المؤسسات الشريكة"))}</h2>
              <ul class="footer__list">${S.partners.map((p) =>
                `<li>${esc(p.name)}</li>`).join("")}</ul>
            </div>
            <div>
              <h2 class="footer__h">${esc(U("التواصل"))}</h2>
              <ul class="footer__list">
                ${pending(c.email, U("البريد"))}
                ${pending(c.phone, U("الهاتف"))}
                ${pending(c.address, U("العنوان"))}
                ${social.length
                  ? social.map(([k, v]) =>
                      `<li><a href="${esc(v)}" target="_blank" rel="noopener">${esc(k)}</a></li>`).join("")
                  : `<li class="footer__pending">${esc(U("روابط التواصل الاجتماعي"))} — ${esc(PENDING)}</li>`}
              </ul>
            </div>
          </div>

          ${CURRENT ? `
          <dl class="colophon">
            <div><dt>${esc(U("أحدث تقرير"))}</dt><dd>${esc(CURRENT.label)}</dd></div>
            <div><dt>${esc(U("المدى"))}</dt><dd>${esc(CURRENT.range)}</dd></div>
            <div><dt>${esc(U("المصدر"))}</dt><dd>${esc(CURRENT.reportTitle)}</dd></div>
            <div><dt>${esc(U("الإعداد"))}</dt><dd>${esc(S.mediaOffice)}</dd></div>
          </dl>` : ""}

          <p class="footer__bar">${esc(S.org.name)}</p>
        </div>
      </footer>`;
  }

  /* ---------- خلية رقم: مقاس الخط يتبع طول النص لا قيمته ----------
     --len عدد محارف النص المعروض. ضبط طباعي بحت لمنع الطفح.
     لا يُشتق منه أي رقم ولا يُعاد تنسيق أي قيمة. */
  function figureCell(m) {
    const shown = (m.prefix ? m.prefix + " " : "") + m.value;
    return `
      <div class="fig${m.accent ? " fig--accent" : ""}">
        <p class="fig__v" style="--len:${shown.length}"><bdi>${esc(shown)}</bdi></p>
        ${m.unit ? `<span class="fig__u">${esc(m.unit)}</span>` : ""}
        <p class="fig__l">${esc(m.label)}</p>
      </div>`;
  }

  /* ---------- شريط الأرقام ----------
     يلتقط أول رقم في كل بند مع وحدته كما كُتبت، ويعرضه بطاقةً.
     استخراج لا اشتقاق: لا جمع ولا حساب، والجملة الكاملة تبقى كما هي أسفله. */
  const STAT_RE = /(\d[\d,]*)\s+([^\s،.:؛()«»]+(?:\s+[^\s،.:؛()«»]+)?)/;

  function statsOf(items) {
    const out = [];
    items.forEach((it) => {
      if (it.term) return;                       // البنود المعنونة ليست أرقاماً
      const m = STAT_RE.exec(it.text || "");
      if (m && m[1].length <= 12) out.push({ value: m[1], unit: m[2] });
    });
    return out;
  }

  const statStrip = (stats) => !stats.length ? "" : `
    <div class="stats">
      ${stats.map((s) => `
        <div class="stat">
          <span class="stat__v" style="--len:${s.value.length}"><bdi>${esc(s.value)}</bdi></span>
          <span class="stat__u">${esc(s.unit)}</span>
        </div>`).join("")}
    </div>`;

  /* ---------- عناصر الحصيلة ---------- */
  function renderGroups(groups) {
    return groups.map((g) => {
      // فقرات «الخلاصة» تلخّص الأرقام فوقها — أداة قراءة خطية لا محتوى.
      // تُطوى ولا تُحذف: النص باقٍ في data.js وفي الإفصاح.
      const main = g.items.filter((it) => !it.recap);
      const recap = g.items.filter((it) => it.recap);
      const stats = statsOf(main);
      const list = `
        <ul class="entries">
          ${main.map((it) => `
            <li class="entry${it.term ? "" : " entry--plain"}">
              ${it.term ? `<p class="entry__term">${esc(it.term)}</p>` : ""}
              <p class="entry__text">${nums(it.text)}</p>
            </li>`).join("")}
        </ul>`;
      const recapList = recap.length ? `
        <details class="more more--recap">
          <summary><span>${esc(U("خلاصة القسم"))}</span><small>${recap.length} ${esc(U("فقرة"))}</small></summary>
          <div class="prose" style="margin-top:.9rem">
            ${recap.map((it) => `<p>${nums(it.text)}</p>`).join("")}
          </div>
        </details>` : "";

      // مجموعة كلها خلاصة: لا تُعرض إلا مطويّة.
      if (g.recap) {
        return `
          <div class="group">
            <details class="more more--recap">
              <summary><span>${esc(g.title || U("خلاصة"))}</span></summary>
              <div class="prose" style="margin-top:.9rem">
                ${g.items.map((it) => `<p>${nums(it.text)}</p>`).join("")}
              </div>
            </details>
          </div>`;
      }

      // تُطوى القائمة إن كانت أرقاماً مستخرجة، أو إن طالت وصفياً.
      const foldable = (stats.length >= 2 && main.length >= 3) || main.length >= 4;
      return `
        <div class="group">
          ${g.title || g.num ? `
            <div class="group__head">
              ${g.num ? `<span class="group__num">${esc(g.num)}</span>` : ""}
              ${g.title ? `<h3 class="h-sub">${esc(g.title)}</h3>` : ""}
            </div>` : ""}
          ${statStrip(stats)}
          ${foldable
            ? `<details class="more">
                 <summary><span>${esc(U("التفاصيل الكاملة"))}</span><small>${main.length} ${esc(U("بنداً"))}</small></summary>
                 ${list}
               </details>`
            : list}
          ${recapList}
        </div>`;
    }).join("");
  }

  function renderBlocks(blocks) {
    return blocks.map((b) => `
      <div class="block">
        <h3 class="h-sub">${esc(b.title)}</h3>
        <div class="figs figs--dense">${b.figures.map(figureCell).join("")}</div>
        ${b.note ? `<p class="block__note"><b>${esc(b.note.term)}:</b> ${nums(b.note.text)}</p>` : ""}
      </div>`).join("");
  }

  function renderTable(t) {
    return `
      ${t.title ? `<h3 class="h-sub">${esc(t.title)}</h3>` : ""}
      <div class="table-wrap">
        <table>
          <thead><tr>${t.head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
          <tbody>${t.rows.map((r) =>
            `<tr>${r.map((c) => `<td>${nums(c)}</td>`).join("")}</tr>`).join("")}</tbody>
          ${t.foot ? `<tfoot><tr>${t.foot.map((c) => `<td>${esc(c)}</td>`).join("")}</tr></tfoot>` : ""}
        </table>
      </div>
      ${t.footNote ? `<p class="table-note">${nums(t.footNote)}</p>` : ""}`;
  }

  function renderGallery(items) {
    if (!items || !items.length) return "";
    return `
      <div class="gallery">
        ${items.map((g) => `
          <figure>
            <img src="${g.src}" alt="${esc(g.caption)}" loading="lazy">
            <figcaption>${esc(g.caption)}</figcaption>
          </figure>`).join("")}
      </div>`;
  }

  // كل أرقام المجال في فترة واحدة، مجموعة من مجموعاته وكتله
  function sectionStats(sec) {
    let out = [];
    (sec.groups || []).forEach((g) => { out = out.concat(statsOf(g.items)); });
    (sec.blocks || []).forEach((b) => {
      (b.figures || []).forEach((f) => out.push({
        value: (f.prefix ? f.prefix + " " : "") + f.value,
        unit: f.unit || f.label
      }));
    });
    return out;
  }

  // عرض مختصر: الافتتاحية وأرقامها فقط. المتن الكامل في صفحة المجال.
  function renderSectionBrief(sec) {
    const stats = (sec.stats && sec.stats.length)
      ? sec.stats : sectionStats(sec).slice(0, 8);
    return `
      ${sec.lead ? `<p class="lead" style="margin-top:clamp(1.25rem,2.5vw,1.9rem)">${esc(sec.lead)}</p>` : ""}
      ${statStrip(stats)}`;
  }

  // تنويه: التفصيل الكامل متاح بالعربية فقط حتى الآن
  const arOnly = (href) => IS_AR ? "" : `
    <p class="ar-only">
      <a href="${href}">${esc(U("التفاصيل الكاملة متاحة بالعربية"))}</a>
    </p>`;

  // محتوى مجال واحد داخل فترة واحدة
  function renderSection(sec) {
    return `
      ${sec.lead ? `<p class="lead" style="margin-top:clamp(1.25rem,2.5vw,1.9rem)">${esc(sec.lead)}</p>` : ""}
      <div style="margin-top:clamp(1.75rem,3.5vw,2.75rem)">
        ${sec.blocks ? renderBlocks(sec.blocks) : ""}
        ${sec.table ? renderTable(sec.table) : ""}
        ${sec.groups ? renderGroups(sec.groups) : ""}
        ${renderGallery(sec.gallery)}
      </div>`;
  }

  /* =====================================================================
     الصفحة الرئيسية — تعريفية دائمة
     ===================================================================== */
  function renderHome() {
    const ord = (i) => String(i).padStart(2, "0");

    // الافتتاحية: صورة بعرض الصفحة، والنص في كرت ورقي يقطع حافتها.
    // الشعار في الترويسة الثابتة، فلا يتكرر هنا. والشعار النصي هو العنوان،
    // لأن اسم التجمع مكتوب أصلاً في الترويسة وفي الشعار.
    /* الافتتاحية سلايدر: الشريحة الأولى هي صورة التجمع ونصّها الثابت،
       ثم شريحة لكل مجال عمل بغلافه ونصّه هو — الرقم والعنوان وتعليق الصورة،
       كلها من data.js حرفياً. العدد مشتقّ من المصفوفة فلا يفترض التخطيط سبعة. */
    const heroSlides = [
      {
        src: "assets/img/photos/field-05.jpg",
        alt: U("من التوثيق الميداني للتجمع"),
        label: U("الافتتاحية"),
        pane: `<ul class="hero__facts">
            <li><b>${esc(String(S.partners.length))}</b><span>${esc(U("مؤسسات شريكة"))}</span></li>
            <li><b>${esc(String(S.pillars.length))}</b><span>${esc(U("مجالات عمل"))}</span></li>
          </ul>`
      }
    ].concat(S.pillars.filter((p) => p.cover && p.cover.src).map((p) => ({
      src: p.cover.src,
      alt: p.cover.caption || U("من التوثيق الميداني للتجمع"),
      label: p.short,
      pane: `<p class="hero__num">${esc(p.num)}</p>
             <p class="hero__st">${esc(p.short)}</p>
             ${p.cover.caption ? `<p class="hero__sc">${esc(p.cover.caption)}</p>` : ""}`
    })));

    const hero = `
      <section class="hero"${heroSlides.length > 1 ? " data-slider" : ""}>
        <div class="hero__shot">
          ${heroSlides.map((sl, i) => `
            <div class="hero__layer${i === 0 ? " is-on" : ""}"${i === 0 ? ' style="z-index:1"' : ""}>
              <img ${i === 0 ? `src="${sl.src}" fetchpriority="high"` : `data-src="${sl.src}"`}
                   alt="${esc(sl.alt)}" decoding="async">
            </div>`).join("")}
        </div>
        <div class="hero__card">
          <p class="hero__eyebrow">${esc(S.org.name)}</p>
          <h1 class="hero__h">${esc(S.org.tagline).replace("ثبات", "<em>ثبات</em>")}</h1>
          <div class="hero__slot">
            ${heroSlides.map((sl, i) => `
              <div class="hero__pane${i === 0 ? " is-on" : ""}" aria-hidden="${i === 0 ? "false" : "true"}">
                ${sl.pane}
              </div>`).join("")}
          </div>
          ${heroSlides.length > 1 ? `
            <div class="hero__dots" role="group" aria-label="${esc(U("شرائح الافتتاحية"))}">
              ${heroSlides.map((sl, i) => `
                <button class="hero__dot" type="button"${i === 0 ? ' aria-current="true"' : ""}
                        aria-label="${esc(sl.label)}"></button>`).join("")}
            </div>` : ""}
        </div>
      </section>`;

    const about = band({
      id: "about",
      main: `
        <h2 class="h-sec">${esc(U("من نحن"))}</h2>
        <div class="prose body-lg" style="margin-top:1.75rem">
          ${asArray(S.founding.story).slice(0, 1).map((p) => `<p>${nums(p)}</p>`).join("")}
        </div>

        <div class="statements">
          ${statement(U("الرؤية"), S.identity.vision)}
          ${statement(U("الرسالة"), S.identity.mission)}
        </div>

        <p style="margin-top:clamp(1.75rem,3vw,2.5rem)">
          <a class="btn btn--ghost" href="${url("about")}">${esc(U("التعريف الكامل"))}</a>
        </p>`,
      aside: mark(ord(1), U("من نحن")) +
        (S.founding.year
          ? `<div class="facts">${fact(String(S.founding.year), U("سنة التأسيس"))}</div>`
          : slot(U("سنة التأسيس"))) +
        `<div style="margin-top:1.5rem">${
          S.governance ? filled(U("الحوكمة واتخاذ القرار"), S.governance)
                          : slot(U("الحوكمة واتخاذ القرار"))}</div>`
    });

    const partners = band({
      id: "partners",
      main: `
        <h2 class="h-sec">${esc(U("المؤسسات الشريكة"))}</h2>
        <div class="partners__grid stagger">
          ${S.partners.map((p) => `
            <article class="partner">
              <span class="partner__logo">
                ${p.logo
                  ? `<img src="${p.logo}" alt="${esc(p.name)}" loading="lazy">`
                  : `<span class="partner__nologo">${esc(U("شعار قيد الاستلام"))}</span>`}
              </span>
              <h3 class="partner__n">${p.site
                ? `<a href="${esc(p.site)}" target="_blank" rel="noopener">${esc(p.name)}</a>`
                : esc(p.name)}</h3>
              ${p.role || p.about
                ? `<p class="partner__meta">${esc(p.role || p.about)}</p>`
                : ""}
            </article>`).join("")}
        </div>`,
      aside: mark(ord(2), U("المؤسسات الشريكة")) +
        `<div class="facts">${fact(String(S.partners.length), U("مؤسسة في المظلة"))}</div>` +
        (S.partners.every((p) => !p.role && !p.about)
          ? `<div style="margin-top:1.5rem">${slot(U("نبذة كل مؤسسة"))}</div>`
          : "")
    });

    const fields = band({
      id: "fields",
      main: `
        <h2 class="h-sec">${esc(U("مجالات العمل"))}</h2>
        <ol class="fields stagger">
          ${S.pillars.map((p) => `
            <li class="field">
              <a class="field__link" href="${url(p.id)}">
                <span class="field__node" aria-hidden="true">
                  <span class="field__n">${esc(p.num)}</span>
                </span>
                <span class="field__head">
                  ${icon(p.id)}
                  <span class="field__t">${esc(p.title)}</span>
                </span>
                <span class="field__o">${esc(p.orgs)}</span>
                <span class="field__go">${esc(U("تفاصيل المجال"))}</span>
              </a>
            </li>`).join("")}
        </ol>`,
      aside: mark(ord(3), U("مجالات العمل")) +
        `<div class="facts">${fact(String(S.pillars.length), U("مجالات دائمة"))}</div>`
    });

    /* لمحة أثر: القسم الوحيد المؤرَّخ في الرئيسية، ويحمل ختمه */
    const n = typeof S.homeMetrics === "number" ? S.homeMetrics : 3;
    const impact = CURRENT ? band({
      id: "impact",
      main: `
        <h2 class="h-sec">${esc(U("لمحة أثر"))}</h2>
        <div class="figs figs--tiles stagger">${CURRENT.metrics.slice(0, n).map(figureCell).join("")}</div>
        <p style="margin-top:clamp(2rem,4vw,3rem)">
          <a class="btn btn--ghost" href="${url("report")}">${esc(U("الإنجازات الكاملة"))}</a>
        </p>`,
      aside: mark(ord(4), U("لمحة أثر")) + seal(CURRENT.label)
    }) : "";

    /* التقارير: أرشيف، والحالي أحدث عناصره */
    const reports = band({
      id: "reports",
      main: `
        <h2 class="h-sec">${esc(U("التقارير"))}</h2>
        <div class="reports stagger">
          ${REPORTS.map((r, i) => `
            <article class="report${i === 0 ? " report--current" : ""}">
              <div>
                <p class="report__k">${i === 0 ? esc(U("أحدث تقرير")) + " · " : ""}${esc(r.label)}</p>
                <h3 class="report__t">${esc(r.reportTitle)}</h3>
                <p class="report__r">${esc(r.range)}</p>
              </div>
              <a class="btn btn--ghost" href="${url(r.id)}">${esc(U("عرض الإنجازات"))}</a>
            </article>`).join("")}
        </div>`,
      aside: mark(ord(5), U("التقارير")) +
        `<div class="facts">${fact(String(REPORTS.length), U("تقارير منشورة"))}</div>` +
        (CURRENT && CURRENT.reportFile
          ? `<p style="margin-top:1.5rem"><a class="btn btn--ghost" href="${esc(CURRENT.reportFile)}">${esc(U("ملف PDF"))}</a></p>`
          : `<div style="margin-top:1.5rem">${slot(U("ملف التقرير PDF"))}</div>`)
    });

    const d = S.donors, c = S.contact;
    const support = band({
      id: "support",
      main: `
        <h2 class="h-sec">${esc(U("الدعم والتواصل"))}</h2>
        <div class="slots--row" style="margin-top:clamp(2rem,4vw,3rem)">
          ${d.donateUrl
            ? `<p><a class="btn btn--green" href="${esc(d.donateUrl)}" target="_blank" rel="noopener">${esc(d.donateLabel)}</a></p>`
            : slot(U("رابط الدعم"))}
          ${d.donateQr
            ? `<figure><img src="${esc(d.donateQr)}" alt="${esc(U("كود QR للدعم"))}"></figure>`
            : slot(U("كود QR"))}
        </div>`,
      aside: mark(ord(6), U("الدعم والتواصل")) + `
        ${c.email   ? filled(U("البريد"), c.email)     : slot(U("البريد"))}
        ${c.phone   ? filled(U("الهاتف"), c.phone)     : slot(U("الهاتف"))}
        ${c.address ? filled(U("العنوان"), c.address)  : slot(U("العنوان"))}`
    });

    const strip = `
      <nav class="band band--flush band--noline areas" aria-label="${esc(U("مجالات العمل"))}">
        <ul class="areas__row">
          ${S.pillars.map((p) => `
            <li><a class="areas__a" href="${url(p.id)}">
              ${icon(p.id)}<span>${esc(p.short)}</span>
            </a></li>`).join("")}
        </ul>
      </nav>`;

    document.title = `${S.org.name}`;
    return header("home") + `<main id="main">
      ${hero}
      ${strip}
      ${about}
      ${partners}
      ${fields}
      ${filmstrip()}
      ${impact}
      ${reports}
      ${support}
    </main>` + footer();
  }

  /* =====================================================================
     صفحة الإنجازات — تقرير فترة واحدة كاملاً
     ===================================================================== */
  function renderReport(rep) {
    document.title = `${rep.reportTitle} — ${S.org.name}`;
    const others = REPORTS.filter((r) => r.id !== rep.id);

    const head = band({
      cls: "ph", noReveal: true,
      main: `
        <p class="ph__kicker">${esc(U("الإنجازات"))}</p>
        <h1 class="h-page">${esc(rep.reportTitle)}</h1>
        <p class="lead" style="margin-top:clamp(1.5rem,3vw,2.25rem)">${esc(rep.range)}</p>
        <div class="prose body-lg" style="margin-top:clamp(1.75rem,3.5vw,2.5rem)">
          ${asArray(rep.intro).map((p) => `<p>${esc(p)}</p>`).join("")}
        </div>`,
      aside: seal(rep.label, U("تقرير دوري")) +
        (rep.reportFile
          ? `<p><a class="btn btn--ghost" href="${esc(rep.reportFile)}">${esc(U("ملف PDF"))}</a></p>`
          : slot(U("ملف التقرير PDF")))
    });

    const notice = rep.notice && rep.notice.length ? band({
      cls: "band--tight",
      main: `
        <h2 class="h-sub">${esc(U("تنبيه توثيقي"))}</h2>
        <div class="prose" style="margin-top:1rem">
          ${asArray(rep.notice).map((p) => `<p>${nums(p)}</p>`).join("")}
        </div>`,
      aside: mark("", U("من التقرير"))
    }) : "";

    const metrics = band({
      cls: "band--dark",
      main: `
        <h2 class="h-sec">${esc(rep.metricsTitle)}</h2>
        <div class="figs figs--tiles stagger">${rep.metrics.map(figureCell).join("")}</div>
        ${rep.highlights && rep.highlights.length ? `
          <ul class="bullets" style="margin-top:clamp(2.5rem,5vw,3.5rem)">
            ${rep.highlights.map((h) => `<li>${nums(h)}</li>`).join("")}
          </ul>` : ""}`,
      aside: seal(rep.label)
    });

    /* إنجازات كل مجال في هذه الفترة، بترتيب المجالات الدائم */
    const sections = S.pillars
      .filter((p) => rep.sections && rep.sections[p.id])
      .map((p) => band({
        cls: "period-body",
        main: `
          <p class="ph__kicker">${icon(p.id)}<span class="ph__kicker__n">${esc(p.num)}</span> ${esc(U("مجال عمل"))}</p>
          <h2 class="h-sec">${esc(p.title)}</h2>
          <p class="ph__orgs">${esc(p.orgs)}</p>
          ${renderSectionBrief(rep.sections[p.id])}
          ${rep.sections[p.id].untranslated ? arOnly(url(p.id, "ar")) : ""}
          <p style="margin-top:clamp(1.5rem,3vw,2.25rem)">
            <a class="btn btn--ghost" href="${url(p.id)}">${esc(U("تفاصيل"))} ${esc(p.short)}</a>
          </p>`,
        aside: seal(rep.label)
      })).join("");

    const summary = rep.summary ? band({
      main: `
        <h2 class="h-sec">${esc(rep.summary.title)}</h2>
        <div style="margin-top:clamp(1.5rem,3vw,2.25rem)">${renderTable({
          head: rep.summary.head, rows: rep.summary.rows, foot: rep.summary.foot
        })}</div>`,
      aside: seal(rep.label)
    }) : "";

    const listBand = (obj, extraCls) => obj && obj.items && obj.items.length ? band({
      cls: extraCls || "",
      main: `
        <h2 class="h-sec">${esc(obj.title)}</h2>
        ${obj.items[0] && obj.items[0].term !== undefined
          ? `<ul class="entries" style="margin-top:clamp(1.5rem,3vw,2.25rem)">
               ${obj.items.map((it) => `
                 <li class="entry${it.term ? "" : " entry--plain"}">
                   ${it.term ? `<p class="entry__term">${esc(it.term)}</p>` : ""}
                   <p class="entry__text">${nums(it.text)}</p>
                 </li>`).join("")}
             </ul>`
          : `<ul class="bullets" style="margin-top:clamp(1.5rem,3vw,2.25rem)">
               ${obj.items.map((it) => `<li>${nums(it)}</li>`).join("")}
             </ul>`}`,
      aside: seal(rep.label)
    }) : "";

    const appeal = rep.appeal && rep.appeal.title ? band({
      main: `
        <h2 class="h-sec">${esc(rep.appeal.title)}</h2>
        <p class="lead" style="margin-top:clamp(1.5rem,3vw,2.25rem)">${esc(rep.appeal.lead)}</p>
        <ul class="bullets">
          ${asArray(rep.appeal.items).map((i) => `<li>${nums(i)}</li>`).join("")}
        </ul>
        <div style="margin-top:clamp(2rem,4vw,3rem)">
          ${S.donors.donateUrl
            ? `<a class="btn btn--green" href="${esc(S.donors.donateUrl)}" target="_blank" rel="noopener">${esc(S.donors.donateLabel)}</a>`
            : slot(U("رابط الدعم"))}
        </div>`,
      aside: seal(rep.label)
    }) : "";

    const closing = rep.closing ? band({
      main: `
        <h2 class="h-sec">${esc(rep.closing.title)}</h2>
        <div class="prose body-lg" style="margin-top:clamp(1.5rem,3vw,2.25rem)">
          ${asArray(rep.closing.paragraphs).map((p) => `<p>${nums(p)}</p>`).join("")}
        </div>
        ${rep.closing.signoff
          ? `<p class="signoff">${esc(rep.closing.signoff)}</p>` : ""}`,
      aside: seal(rep.label)
    }) : "";

    const archive = `
      <section class="band pnav">
        <div class="sheet">
          <div class="sheet__main">
            ${others.length ? `
              <h2 class="h-sub">${esc(U("تقارير أخرى"))}</h2>
              <div class="pnav__grid" style="margin-top:1.25rem">
                ${others.map((r) => `
                  <a class="pnav__card" href="${url(r.id)}">
                    <span class="pnav__k">${esc(r.label)}</span>
                    <span class="pnav__t">${esc(r.reportTitle)}</span>
                  </a>`).join("")}
              </div>` : ""}
            <p style="margin-top:1.5rem">
              <a class="btn btn--ghost" href="${homeUrl()}">${esc(U("العودة إلى الرئيسية"))}</a>
            </p>
          </div>
          <aside class="sheet__aside"></aside>
        </div>
      </section>`;

    const photo = rep.appeal && rep.appeal.photo
      ? plate(rep.appeal.photo.src, rep.appeal.photo.caption, true)
      : "";

    return header("report") + `<main id="main">
      ${head}
      ${notice}
      ${metrics}
      ${sections}
      ${summary}
      ${listBand(rep.reading)}
      ${listBand(rep.dataNotes)}
      ${listBand(rep.opportunities)}
      ${appeal}
      ${photo}
      ${closing}
      ${archive}
    </main>` + footer();
  }

  /* =====================================================================
     صفحة مجال عمل — نصفها دائم ونصفها مؤرَّخ، والفصل مرئي
     ===================================================================== */
  function renderField(i) {
    const p = S.pillars[i];
    const prev = S.pillars[i - 1];
    const next = S.pillars[i + 1];
    document.title = `${p.title} — ${S.org.name}`;

    const posDots = S.pillars.map((_, k) =>
      `<span class="pos__d${k === i ? " is-on" : ""}"></span>`).join("");

    const head = band({
      cls: "ph", noReveal: true,
      main: `
        <p class="ph__mark">
          <span class="ph__ico">${icon(p.id)}</span>
          <span class="ph__of">${esc(p.num)} / ${esc(String(S.pillars.length))}</span>
        </p>
        <h1 class="h-page">${esc(p.title)}</h1>
        <p class="ph__orgs">${esc(p.orgs)}</p>
        <div class="ph__def">
          ${p.definition
            ? `<p class="lead">${esc(p.definition)}</p>`
            : slot(U("التعريف الدائم بالمجال"))}
        </div>`,
      aside: `
        <span class="pos" aria-hidden="true">${posDots}</span>
        ${mark("", U("مجال عمل"))}`
    });

    // حصيلة المجال: أحدث تقرير يذكره، وقد لا يكون التقرير الحالي.
    const rep = latestFor(p.id);
    const sec = rep && rep.sections[p.id];
    const alsoIn = REPORTS.filter((r) => r.sections && r.sections[p.id] && r.id !== (rep && rep.id));

    const body = sec ? band({
      cls: "period-body",
      main: `
        <h2 class="h-sec">${esc(U("إنجازات الفترة"))}</h2>
        ${sec.untranslated ? renderSectionBrief(sec) + arOnly(url(p.id, "ar")) : renderSection(sec)}`,
      aside: seal(rep.label) +
        `<p style="margin-top:1.25rem"><a class="btn btn--ghost" href="${url(rep.id)}">${esc(U("التقرير الكامل"))}</a></p>` +
        (alsoIn.length ? `
          <p class="mark" style="margin-top:2rem"><span class="mark__t">${esc(U("فترات أخرى"))}</span></p>
          <ul class="footer__list aside-list">
            ${alsoIn.map((r) => `<li><a href="${url(r.id)}">${esc(r.label)}</a></li>`).join("")}
          </ul>` : "")
    }) : band({
      main: `<h2 class="h-sec">${esc(U("إنجازات الفترة"))}</h2>
             <div style="margin-top:1.5rem">${slot(U("حصيلة هذا المجال"), U("لم تَرِد في التقارير المنشورة بعد"))}</div>`,
      aside: mark("", U("حصيلة"))
    });

    const navCard = (k, item) => item
      ? `<a class="pnav__card" href="${url(item.id)}">
           <span class="pnav__k">${esc(k)}</span>
           <span class="pnav__t">${esc(item.short)}</span>
         </a>`
      : `<span class="pnav__empty"></span>`;

    const nav = `
      <section class="band pnav">
        <div class="sheet">
          <div class="sheet__main">
            <div class="pnav__grid">
              ${navCard(U("المجال السابق"), prev)}
              ${navCard(U("المجال التالي"), next)}
            </div>
            <p style="margin-top:1.5rem">
              <a class="btn btn--ghost" href="${homeUrl()}#fields">${esc(U("كل المجالات"))}</a>
            </p>
          </div>
          <aside class="sheet__aside"></aside>
        </div>
      </section>`;

    return header("") + `<main id="main">
      ${head}
      ${p.cover ? plate(p.cover.src, p.cover.caption, true, null, p.num) : ""}
      ${body}
      ${nav}
    </main>` + footer();
  }

  /* =====================================================================
     صفحة التعريف الكامل — كل ما هو دائم، بلا تاريخ
     ===================================================================== */
  function renderAbout() {
    document.title = `من نحن — ${S.org.name}`;
    const V = S.identity, F = S.founding;

    const head = band({
      cls: "ph", noReveal: true,
      main: `
        <p class="ph__kicker">${esc(U("التعريف الكامل"))}</p>
        <h1 class="h-page">${esc(U("من نحن"))}</h1>
        <div class="prose body-lg" style="margin-top:clamp(1.75rem,3.5vw,2.5rem)">
          ${asArray(S.intro).map((x) => `<p>${esc(x)}</p>`).join("")}
          ${asArray(F.story).map((x) => `<p>${nums(x)}</p>`).join("")}
        </div>`,
      aside: (F.year
          ? `<div class="facts">${fact(String(F.year), U("سنة التأسيس"))}</div>`
          : slot(U("سنة التأسيس"))) +
        `<div class="facts" style="margin-top:1.5rem">
           ${fact(String(S.partners.length), U("مؤسسات شريكة"))}
           ${fact(String(S.pillars.length), U("مجالات عمل"))}
         </div>`
    });

    const identity = band({
      main: `
        ${statement(U("الرؤية"), V.vision)}
        ${statement(U("الرسالة"), V.mission)}
        ${V.values ? `
          <h2 class="h-sub sub-head">${esc(U("القيم الأساسية"))}</h2>
          <ul class="entries">
            ${asArray(V.values).map((v) => `
              <li class="entry${v.term ? "" : " entry--plain"}">
                ${v.term ? `<p class="entry__term">${esc(v.term)}</p>` : ""}
                <p class="entry__text">${nums(v.text || v)}</p>
              </li>`).join("")}
          </ul>` : `<div class="sub-head">${slot(U("القيم"))}</div>`}`,
      aside: mark("", U("الهوية")) +
        `<div style="margin-top:1rem">${
          S.governance ? filled(U("الحوكمة واتخاذ القرار"), S.governance)
                          : slot(U("الحوكمة واتخاذ القرار"))}</div>`
    });

    const aims = (S.goals && S.goals.length) || (S.aspirations && S.aspirations.length)
      ? band({
          main: `
            ${S.goals && S.goals.length ? `
              <h2 class="h-sec">${esc(U("الأهداف"))}</h2>
              <ul class="bullets bullets--two">
                ${S.goals.map((g) => `<li>${nums(g)}</li>`).join("")}
              </ul>` : ""}
            ${S.aspirations && S.aspirations.length ? `
              <h2 class="h-sec sub-head">${esc(U("التطلعات الاستراتيجية"))}</h2>
              <ul class="bullets">
                ${S.aspirations.map((g) => `<li>${nums(g)}</li>`).join("")}
              </ul>` : ""}`,
          aside: mark("", U("إلى أين"))
        })
      : "";

    const nav = `
      <section class="band pnav">
        <div class="sheet">
          <div class="sheet__main">
            <div class="pnav__grid">
              <a class="pnav__card" href="${homeUrl()}#partners">
                <span class="pnav__k">${esc(U("المؤسسات الشريكة"))}</span>
                <span class="pnav__t">${esc(String(S.partners.length))} ${esc(U("مؤسسة تحت المظلة"))}</span>
              </a>
              <a class="pnav__card" href="${homeUrl()}#fields">
                <span class="pnav__k">${esc(U("مجالات العمل"))}</span>
                <span class="pnav__t">${esc(String(S.pillars.length))} ${esc(U("مجالات دائمة"))}</span>
              </a>
            </div>
            <p style="margin-top:1.5rem">
              <a class="btn btn--ghost" href="${homeUrl()}">${esc(U("العودة إلى الرئيسية"))}</a>
            </p>
          </div>
          <aside class="sheet__aside"></aside>
        </div>
      </section>`;

    return header("") + `<main id="main">${head}${identity}${aims}${nav}</main>` + footer();
  }

  function renderNotFound() {
    document.title = `الصفحة غير موجودة — ${S.org.name}`;
    return header("") + `<main id="main">${band({
      cls: "ph", noReveal: true,
      main: `
        <h1 class="h-page">${esc(U("هذه الصفحة غير موجودة"))}</h1>
        <p class="lead" style="margin-top:clamp(1.5rem,3vw,2.25rem)">
          ${esc(U("الرابط لا يطابق أي مجال عمل ولا أي تقرير في الموقع."))}
        </p>
        <p style="margin-top:clamp(2rem,4vw,3rem)">
          <a class="btn btn--green" href="${homeUrl()}">${esc(U("العودة إلى الرئيسية"))}</a>
        </p>`,
      aside: `<ul class="footer__list aside-list">${S.pillars.map((p) =>
        `<li><a href="${url(p.id)}">${esc(p.short)}</a></li>`).join("")}</ul>`
    })}</main>` + footer();
  }

  /* ---------- التوجيه ---------- */
  function renderInner() {
    const id = new URLSearchParams(location.search).get("id");
    // "report" و "summary" معرّفان قديمان يقودان إلى أحدث تقرير.
    if (id === "about") return renderAbout();
    if ((id === "report" || id === "summary") && CURRENT) return renderReport(CURRENT);
    const rep = reportById(id);
    if (rep) return renderReport(rep);
    const i = S.pillars.findIndex((p) => p.id === id);
    return i === -1 ? renderNotFound() : renderField(i);
  }

  /* ---------- التشغيل ---------- */
  /* =====================================================================
     سلايدر الافتتاحية
     ---------------------------------------------------------------------
     الانتقال كشفٌ لا حركة: الصورة الجديدة تُزاح عنها الستارة من جهة بدء
     السطر، والصورة نفسها لا تتحرّك ولا تتكبّر — فلا حركة تُفرض على مادّة
     جادّة، والشكل هندسي كبقية مفردات الموقع. النص يتلوها بعد 0.4s متدرّجاً
     سطراً سطراً. يتوقّف الدوران عند أول تدخّل من المستخدم، وعند تمرير
     المؤشّر على البطاقة، وفي اللسان الخلفي، ويُلغى كلياً مع
     prefers-reduced-motion (تبقى المؤشّرات تعمل بلا انتقال).
     ===================================================================== */
  function heroSlider() {
    const hero = $(".hero[data-slider]");
    if (!hero) return;
    const layers = [...hero.querySelectorAll(".hero__layer")];
    const panes  = [...hero.querySelectorAll(".hero__pane")];
    const dots   = [...hero.querySelectorAll(".hero__dot")];
    if (layers.length < 2) return;

    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DWELL = 7000;
    let at = 0, z = 1, timer = 0, held = false, took = false;

    /* الصور ما عدا الأولى تُحمَّل عند الحاجة، فلا تُثقل أول رسم للصفحة */
    const load = (k) => {
      const img = layers[k] && layers[k].querySelector("img[data-src]");
      if (img) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
    };

    const go = (k) => {
      k = (k + layers.length) % layers.length;
      if (k === at) return;
      load(k); load((k + 1) % layers.length);

      /* الطبقات السابقة تبقى مكشوفة تحت الجديدة، والترتيب بـz-index لا
         بترتيب العناصر — فالرجوع إلى شريحة سابقة يعمل كالتقدّم سواء. */
      const l = layers[k];
      l.classList.remove("is-on");
      l.style.transition = "none";
      void l.offsetWidth;
      l.style.zIndex = ++z;
      l.style.transition = "";
      void l.offsetWidth;
      l.classList.add("is-on");

      panes.forEach((pn, n) => {
        pn.classList.toggle("is-on", n === k);
        pn.setAttribute("aria-hidden", n === k ? "false" : "true");
      });
      dots.forEach((d, n) => {
        if (n === k) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      at = k;
    };

    const plan = () => {
      clearTimeout(timer);
      if (calm || took) return;
      timer = setTimeout(() => {
        if (!held && !document.hidden) go(at + 1);
        plan();
      }, DWELL);
    };

    /* أول تدخّل من المستخدم يوقف الدوران نهائياً: هو آلية الإيقاف
       التي يوجبها معيار الوصول لكل محتوى يتحرّك تلقائياً. */
    const take = () => { took = true; clearTimeout(timer); };

    dots.forEach((d, n) => d.addEventListener("click", () => { take(); go(n); }));

    hero.addEventListener("keydown", (e) => {
      if (!e.target.closest(".hero__dots")) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const ltr = document.documentElement.dir !== "rtl";
      take();
      go(at + ((e.key === "ArrowRight") === ltr ? 1 : -1));
      dots[at].focus();
    });

    /* القراءة على البطاقة توقف العدّ، لا المرور فوق الصورة كلها */
    const card = $(".hero__card", hero);
    if (card) {
      card.addEventListener("pointerenter", () => { held = true; });
      card.addEventListener("pointerleave", () => { held = false; });
    }
    hero.addEventListener("focusin",  () => { held = true; });
    hero.addEventListener("focusout", () => { held = false; });

    load(1);
    plan();
  }

  /* =====================================================================
     تنعيم التمرير — تخميد أُسّي على عجلة الفأرة وحدها
     ---------------------------------------------------------------------
     العجلة تعطي قفزات منفصلة، فتُخمَّد حتى تنساب. وما عداها يُترك كما هو:
     اللمس له قصوره الذاتي الأصلي وخطفه يفسده، ولوحة المفاتيح وروابط
     المراسي تبقى على scroll-behavior: smooth في الـCSS. التمرير أصلي —
     لا تحريك للـbody بـtransform — فالترويسة position: fixed تبقى سليمة.
     يُلغى كلياً مع prefers-reduced-motion.
     ===================================================================== */
  function smoothWheel() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(pointer: fine)").matches) return;   /* اللمس له نعومته */

    /* behavior:"instant" يتجاوز scroll-behavior: smooth لكل إطار على حدة،
       فلا نقلب خاصية في الـCSS ولا يبقى شيء عالقاً إن غابت إطارات الرسم.
       إن لم يدعمه المتصفح فلا تنعيم — والتمرير الأصلي سليم كما هو. */
    try { scrollTo({ top: scrollY, behavior: "instant" }); } catch (e) { return; }

    /* مقبضان للضبط:
       TAU  ثابت التخميد بالملّي ثانية — أكبر = أبطأ وأنعم، أصغر = أقرب للأصلي.
       MULT مضاعف مسافة النقرة الواحدة — يُترك 1 حتى لا تثقل الصفحة. */
    const TAU = 150, MULT = 1;

    let target = scrollY, pos = scrollY, last = 0, began = 0, running = false;
    const put = (y) => scrollTo({ top: y, behavior: "instant" });
    const limit = () =>
      Math.max(0, document.documentElement.scrollHeight - innerHeight);

    const step = (t) => {
      if (!running) return;
      /* الحدّ 200ms لا 50: مع سقوط الإطارات يلحق التخميد نفسه بالزمن
         الحقيقي بدل أن يتقدّم بالإطار فيبطؤ بطئاً غير مقصود. */
      const dt = Math.min(last ? t - last : 16, 200);
      last = t;
      const diff = target - pos;
      /* حارس زمني: إن تعثّرت الإطارات طويلاً بعد آخر نقرة، أنهِ ولا تعلق */
      if (Math.abs(diff) < 0.5 || t - began > 2500) {
        pos = target; put(pos); running = false; last = 0; return;
      }
      pos += diff * (1 - Math.exp(-dt / TAU));
      put(pos);
      requestAnimationFrame(step);
    };

    /* منطقة لها تمريرها الرأسي الخاص لا تُخطف منها العجلة */
    const ownsScroll = (el) => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        if (n.scrollHeight > n.clientHeight + 1) {
          const o = getComputedStyle(n).overflowY;
          if (o === "auto" || o === "scroll") return true;
        }
      }
      return false;
    };

    addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.defaultPrevented) return;   /* تكبير الصفحة */
      if (ownsScroll(e.target)) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? innerHeight : 1;
      if (!running) {
        pos = target = scrollY;
        running = true; last = 0;
        requestAnimationFrame(step);
      }
      began = performance.now();
      target = Math.min(limit(), Math.max(0, target + e.deltaY * unit * MULT));
    }, { passive: false });

    /* تمرير من مصدر آخر — لوحة مفاتيح، مرساة، شريط التمرير، تركيز — يعيد المزامنة */
    addEventListener("scroll", () => { if (!running) pos = target = scrollY; },
                     { passive: true });

    /* نقرة أو مفتاح: أفلت المقبض فوراً ولا تنازع المستخدم */
    const release = () => { running = false; last = 0; };
    addEventListener("keydown", release, { passive: true });
    addEventListener("pointerdown", release, { passive: true });
  }

  function boot() {
    // لغة المستند واتجاهه قبل أي رسم
    const L = LANGS[LANG];
    document.documentElement.lang = L.code;
    document.documentElement.dir = L.dir;
    document.documentElement.classList.toggle("is-ltr", L.dir === "ltr");

    const page = document.body.dataset.page;
    document.body.innerHTML = page === "pillar" ? renderInner() : renderHome();

    const btn = $(".nav-toggle"), nav = $("#nav");
    if (btn && nav) {
      const setOpen = (open) => {
        nav.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      };
      btn.addEventListener("click", () =>
        setOpen(btn.getAttribute("aria-expanded") !== "true"));
      nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
          setOpen(false); btn.focus();
        }
      });
    }

    /* تنويه الترجمة غير المعتمدة مثبّت أعلى الصفحة: يُقاس ليُزاح ما تحته */
    const xb = document.querySelector(".xbanner");
    const measureXb = () => {
      if (!xb) return;
      document.documentElement.classList.add("has-xbanner");
      document.documentElement.style.setProperty("--xb", xb.offsetHeight + "px");
    };
    measureXb();
    addEventListener("resize", measureXb);

    /* الشريط العائم: يشتدّ قليلاً بعد مغادرة أعلى الصفحة */
    const onScroll = () => {
      document.documentElement.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    heroSlider();
    smoothWheel();

    /* تتابع داخل الحاوية: كل ابن يتأخر قليلاً عن سابقه.
       لا يُطبَّق إلا بعد ظهور القسم، ويُلغى كلياً مع prefers-reduced-motion. */
    document.querySelectorAll(".stagger").forEach((c) => {
      [...c.children].forEach((ch, i) => ch.style.setProperty("--i", Math.min(i, 11)));
    });

    /* شريط الصور: أظهر مؤشر «يُمرَّر» ما دام فيه بقية */
    document.querySelectorAll(".film__strip").forEach((st) => {
      const sync = () => {
        const end = Math.abs(st.scrollLeft) + st.clientWidth >= st.scrollWidth - 4;
        st.classList.toggle("is-end", end);
      };
      st.addEventListener("scroll", sync, { passive: true });
      sync();
    });

    /* لحظة ظهور واحدة، بطيئة. تُلغى كلياً مع prefers-reduced-motion.
       الإخفاء لا يُفعَّل إلا بعد التأكد من وجود مراقب يعمل، وثمة حارس
       يلغي النظام كله إن لم يستجب — فلا يبقى محتوى غير مرئي أبداً. */
    const items = document.querySelectorAll(".reveal");
    const showAll = () => {
      document.documentElement.classList.remove("js-reveal");
      items.forEach((n) => n.classList.add("is-in"));
    };

    if (!window.IntersectionObserver ||
        matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return;
    }

    document.documentElement.classList.add("js-reveal");
    let alive = false;                 // وصل نداء من المراقب = يعمل
    const io = new IntersectionObserver((entries) => {
      alive = true;
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });

    /* ما هو في الشاشة عند التهيئة يُكشف فوراً وبشكل متزامن، بلا انتظار
       المراقب: نداؤه الأول غير متزامن، وقد يتأخّر أو لا يصل أصلاً في لسان
       خلفي أو سياق مخنوق الإطارات — فيبقى ما تراه العين مخفيّاً. */
    var near = innerHeight * 1.15;
    items.forEach((n) => {
      if (n.getBoundingClientRect().top < near) n.classList.add("is-in");
      else io.observe(n);
    });

    /* حارس عند 600ms لا 2000: ثانيتان بيضاوان عطلٌ يُرى لا احتياط.
       و alive تعني «المراقب حيّ» لا «عنصر تقاطع» — فصفحة لا شيء فيها
       ظاهر ابتداءً لم تعد تفقد الحركة كلها. */
    setTimeout(() => { if (!alive) showAll(); }, 600);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
