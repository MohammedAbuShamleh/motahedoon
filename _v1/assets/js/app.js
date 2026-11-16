/* =====================================================================
   تجمع متحدون من أجل غزة — بناء الصفحات من SITE (data.js)
   لا يوجد نص ثابت هنا سوى تسميات الواجهة. المحتوى كله من data.js.
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- أدوات ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // تلوين الأرقام داخل النص بالأخضر — لغة بصرية مأخوذة من التقرير.
  // لا يغيّر النص، يغلّفه فقط.
  const nums = (s) => esc(s).replace(/(\d[\d,،.]*\d|\d)/g, '<span class="num">$1</span>');

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  const pillarUrl = (id) => `pillar.html?id=${encodeURIComponent(id)}`;

  /* ---------- الترويسة ---------- */
  function header(active) {
    const links = [
      { href: active === "home" ? "#about" : "index.html#about", label: "عن التجمع" },
      { href: active === "home" ? "#pillars" : "index.html#pillars", label: "المحاور" },
      { href: pillarUrl(SITE.summary.id), label: "الملخص الشامل" },
      { href: active === "home" ? "#partners" : "index.html#partners", label: "المؤسسات الشريكة" },
      { href: active === "home" ? "#donors" : "index.html#donors", label: "الدعم" }
    ];
    return `
      <a class="skip" href="#main">تخطَّ إلى المحتوى</a>
      <header class="site-header">
        <div class="wrap site-header__in">
          <a class="brand" href="index.html">
            <img src="${SITE.org.logoMark}" alt="">
            <span><b>${esc(SITE.org.shortName)}</b><span>${esc(SITE.org.name)}</span></span>
          </a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav">القائمة</button>
          <nav class="nav" id="nav">
            ${links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join("")}
          </nav>
        </div>
      </header>`;
  }

  /* ---------- شريط الشعارات ---------- */
  function partnerStrip(label) {
    return `
      <section class="strip" id="partners">
        <div class="wrap">
          <div class="strip__card">
            <p class="strip__label">${esc(label)}</p>
            <ul class="strip__row">
              ${SITE.partners.map((p) => `
                <li title="${esc(p.name)}">
                  ${p.site ? `<a href="${esc(p.site)}" target="_blank" rel="noopener">` : ""}
                  <img src="${p.logo}" alt="${esc(p.name)}" loading="lazy">
                  ${p.site ? "</a>" : ""}
                </li>`).join("")}
            </ul>
          </div>
        </div>
      </section>`;
  }

  /* ---------- التذييل ---------- */
  function footer() {
    const c = SITE.contact;
    const pending = (v, label) =>
      v ? `<li>${esc(v)}</li>` : `<li class="footer__pending">[ ${label} — غير معتمد بعد ]</li>`;

    const social = Object.entries(c.social).filter(([, v]) => v);

    return `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer__grid">
            <div class="footer__logo">
              <span class="footer__logo__card">
                <img src="${SITE.org.logoFull}" alt="${esc(SITE.org.name)}">
              </span>
              <p style="font-size:.92rem;line-height:1.6;margin:0">${esc(SITE.mediaOffice)}</p>
            </div>
            <div>
              <h4>المحاور</h4>
              <ul>${SITE.pillars.map((p) =>
                `<li><a href="${pillarUrl(p.id)}">${esc(p.short)}</a></li>`).join("")}</ul>
            </div>
            <div>
              <h4>المؤسسات الشريكة</h4>
              <ul>${SITE.partners.map((p) => `<li>${esc(p.name)}</li>`).join("")}</ul>
            </div>
            <div>
              <h4>التواصل</h4>
              <ul>
                ${pending(c.email, "البريد")}
                ${pending(c.phone, "الهاتف")}
                ${pending(c.address, "العنوان")}
                ${social.length
                  ? social.map(([k, v]) => `<li><a href="${esc(v)}" target="_blank" rel="noopener">${esc(k)}</a></li>`).join("")
                  : `<li class="footer__pending">[ روابط التواصل الاجتماعي — غير معتمدة بعد ]</li>`}
              </ul>
            </div>
          </div>
          <div class="footer__bar">
            <span>${esc(SITE.org.name)}</span>
            <span>الأرقام الواردة من ${esc(SITE.period.reportTitle)}</span>
          </div>
        </div>
      </footer>`;
  }

  /* ---------- عناصر مشتركة في صفحة المحور ---------- */
  function renderGroups(groups) {
    return groups.map((g) => `
      <div class="group">
        ${g.title || g.num ? `
          <div class="group__head">
            ${g.num ? `<span class="group__num">${esc(g.num)}</span>` : ""}
            ${g.title ? `<h2>${esc(g.title)}</h2>` : ""}
          </div>` : ""}
        <ul class="group__list">
          ${g.items.map((it) => `
            <li>${it.term ? `<b>${esc(it.term)}:</b> ` : ""}${nums(it.text)}</li>`).join("")}
        </ul>
      </div>`).join("");
  }

  function renderBlocks(blocks) {
    return blocks.map((b) => `
      <div class="block">
        <h3>${esc(b.title)}</h3>
        <div class="figures">
          ${b.figures.map((f) => `
            <div class="figure">
              <p class="figure__l">${esc(f.label)}</p>
              <p class="figure__v">
                ${f.unit ? `<span class="figure__u">${esc(f.unit)}</span>` : ""}
                <span>${f.prefix ? esc(f.prefix) + " " : ""}${esc(f.value)}</span>
              </p>
            </div>`).join("")}
        </div>
        ${b.note ? `<p class="block__note"><b>${esc(b.note.term)}:</b> ${nums(b.note.text)}</p>` : ""}
      </div>`).join("");
  }

  function renderTable(t) {
    return `
      ${t.title ? `<h2 class="sec-title" style="font-size:1.35rem">${esc(t.title)}</h2>` : ""}
      <div class="table-wrap">
        <table>
          <thead><tr>${t.head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
          <tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${nums(c)}</td>`).join("")}</tr>`).join("")}</tbody>
          ${t.foot ? `<tfoot><tr>${t.foot.map((c) => `<td>${esc(c)}</td>`).join("")}</tr></tfoot>` : ""}
        </table>
      </div>
      ${t.footNote ? `<p class="table-note">${nums(t.footNote)}</p>` : ""}`;
  }

  function renderGallery(items) {
    if (!items || !items.length) return "";
    return `
      <section class="gallery">
        <div class="wrap">
          <p class="eyebrow">من الميدان</p>
          <div class="gallery__grid">
            ${items.map((g) => `
              <figure>
                <img src="${g.src}" alt="${esc(g.caption)}" loading="lazy">
                <figcaption>${esc(g.caption)}</figcaption>
              </figure>`).join("")}
          </div>
        </div>
      </section>`;
  }

  /* ---------- الصفحة الرئيسية ---------- */
  function renderHome() {
    const d = SITE.donors;

    const hero = `
      <section class="hero">
        <div class="wrap">
          <div class="hero__grid">
            <div>
              <p class="eyebrow">${esc(SITE.period.label)} · ${esc(SITE.period.range)}</p>
              <h1>تجمع <span class="of">متحدون</span><br>من أجل غزة</h1>
              <p class="hero__tag">${esc(SITE.org.tagline).replace("ثبات", "<em>ثبات</em>")}</p>
              <p class="hero__meta">
                <span><b>${SITE.partners.length}</b> مؤسسات شريكة</span>
                <span><b>${SITE.pillars.length}</b> محاور عمل</span>
                <span>${esc(SITE.mediaOffice)}</span>
              </p>
            </div>
            <div class="hero__root">
              <div class="hero__logo"><img src="${SITE.org.logoFull}" alt="${esc(SITE.org.name)}"></div>
              <div class="hero__stem" aria-hidden="true"></div>
            </div>
          </div>
          <figure class="hero__band reveal" style="margin-bottom:0">
            <img src="assets/img/photos/water-line.jpg" alt="من التغطيات الميدانية للتجمع">
            <figcaption>من الميدان</figcaption>
          </figure>
        </div>
      </section>`;

    const about = `
      <section class="about" id="about">
        <div class="wrap">
          <p class="eyebrow">عن التجمع</p>
          <div class="about__grid reveal">
            <h2 class="sec-title">منظومة استجابة ميدانية شاملة</h2>
            <div>
              <p>${esc(SITE.intro[0])}</p>
              <p class="about__quote">${esc(SITE.intro[1])}</p>
            </div>
          </div>
        </div>
      </section>`;

    const metrics = `
      <section class="metrics" id="metrics">
        <div class="wrap">
          <p class="eyebrow">${esc(SITE.metricsTitle)}</p>
          <div class="metrics__grid reveal">
            ${SITE.metrics.map((m) => `
              <div class="metric${m.accent ? " metric--accent" : ""}">
                <p class="metric__n">
                  <span>${m.prefix ? esc(m.prefix) + " " : ""}${esc(m.value)}</span>
                </p>
                ${m.unit ? `<span class="metric__unit">${esc(m.unit)}</span>` : ""}
                <p class="metric__l">${esc(m.label)}</p>
              </div>`).join("")}
          </div>
        </div>
      </section>`;

    const pillars = `
      <section class="pillars" id="pillars">
        <div class="wrap">
          <p class="eyebrow">محاور العمل</p>
          <h2 class="sec-title">ستة محاور، بترتيب مقصود</h2>
          <ul class="pillars__list">
            ${SITE.pillars.map((p) => `
              <li class="pillar-row reveal">
                <span class="pillar-row__node" aria-hidden="true">
                  <span class="pillar-row__num">${esc(p.num)}</span>
                  <span class="pillar-row__branch"></span>
                </span>
                <a class="pillar-row__link" href="${pillarUrl(p.id)}">
                  <h3>${esc(p.title)}</h3>
                  <p class="pillar-row__orgs">${esc(p.orgs)}</p>
                  <span class="pillar-row__go">تفاصيل المحور</span>
                </a>
              </li>`).join("")}
          </ul>
        </div>
      </section>`;

    const callout = `
      <section class="callout">
        <div class="wrap">
          <div class="callout__card reveal">
            <div>
              <h2>${esc(SITE.summary.title)}</h2>
              <p>حصيلة ${esc(SITE.period.label)} في جدول واحد: المشاريع والأنشطة، وحجم الاستفادة، والأثر المباشر.</p>
            </div>
            <a class="btn btn--light" href="${pillarUrl(SITE.summary.id)}">عرض الجدول</a>
          </div>
        </div>
      </section>`;

    const donors = `
      <section class="donors" id="donors">
        <div class="wrap">
          <p class="eyebrow">${esc(d.title)}</p>
          <div class="donors__grid reveal">
            <div>
              <p class="lead">${esc(d.lead)}</p>
              <ul>${d.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
              ${d.donateUrl
                ? `<p style="margin-top:1.75rem"><a class="btn btn--green" href="${esc(d.donateUrl)}" target="_blank" rel="noopener">${esc(d.donateLabel)}</a></p>`
                : `<p class="donors__pending">[ رابط الدعم وكود QR — غير معتمدين بعد. يُضاف الرابط في data.js فيظهر الزر تلقائياً. ]</p>`}
            </div>
            <figure class="donors__fig">
              <img src="${d.photo.src}" alt="${esc(d.photo.caption)}" loading="lazy">
              <figcaption>${esc(d.photo.caption)}</figcaption>
            </figure>
          </div>
        </div>
      </section>`;

    document.title = `${SITE.org.name} — موقع تعريفي`;
    return header("home") + `<main id="main">
      ${hero}
      ${partnerStrip("المؤسسات الشريكة في التجمع")}
      ${about}
      ${metrics}
      ${pillars}
      ${callout}
      ${donors}
    </main>` + footer();
  }

  /* ---------- صفحة المحور ---------- */
  function renderPillar() {
    const id = new URLSearchParams(location.search).get("id");

    // صفحة الملخص الشامل
    if (id === SITE.summary.id) {
      document.title = `${SITE.summary.title} — ${SITE.org.name}`;
      const body = `
        <section class="pillar-head">
          <div class="wrap">
            <p class="eyebrow">${esc(SITE.period.label)}</p>
            <h1>${esc(SITE.summary.title)}</h1>
            <p class="lead pillar-head__lead">${esc(SITE.period.range)}</p>
          </div>
        </section>
        <section class="pillar-body">
          <div class="wrap">${renderTable(SITE.summary)}</div>
        </section>
        <section class="pillar-nav">
          <div class="wrap"><a class="btn btn--ghost" href="index.html">العودة إلى الرئيسية</a></div>
        </section>`;
      return header("") + `<main id="main">${body}</main>` + footer();
    }

    const i = SITE.pillars.findIndex((p) => p.id === id);
    if (i === -1) {
      document.title = `الصفحة غير موجودة — ${SITE.org.name}`;
      return header("") + `<main id="main"><section class="pillar-head"><div class="wrap">
        <h1>هذا المحور غير موجود</h1>
        <p class="lead pillar-head__lead">الرابط لا يطابق أي محور في الموقع.</p>
        <p style="margin-top:1.5rem"><a class="btn btn--green" href="index.html">العودة إلى الرئيسية</a></p>
      </div></section></main>` + footer();
    }

    const p = SITE.pillars[i];
    const prev = SITE.pillars[i - 1];
    const next = SITE.pillars[i + 1];
    document.title = `${p.title} — ${SITE.org.name}`;

    const navCard = (t, item) => item
      ? `<a href="${pillarUrl(item.id)}"><small>${t}</small><b>${esc(item.short)}</b></a>`
      : `<span class="is-empty"></span>`;

    const body = `
      <section class="pillar-head">
        <div class="wrap">
          <p class="pillar-head__num">${esc(p.num)}</p>
          <h1>${esc(p.title)}</h1>
          <p class="pillar-head__orgs">${esc(p.orgs)}</p>
          ${p.lead ? `<p class="lead pillar-head__lead">${esc(p.lead)}</p>` : ""}
          ${p.cover ? `
            <figure class="pillar-cover reveal">
              <img src="${p.cover.src}" alt="${esc(p.cover.caption)}">
              <figcaption>${esc(p.cover.caption)}</figcaption>
            </figure>` : ""}
        </div>
      </section>

      <section class="pillar-body">
        <div class="wrap">
          ${p.blocks ? renderBlocks(p.blocks) : ""}
          ${p.table ? renderTable(p.table) : ""}
          ${p.groups ? renderGroups(p.groups) : ""}
        </div>
      </section>

      ${renderGallery(p.gallery)}

      <section class="pillar-nav">
        <div class="wrap">
          <div class="pillar-nav__grid">
            ${navCard("المحور السابق", prev)}
            ${navCard("المحور التالي", next)}
          </div>
          <p style="margin-top:1.25rem"><a class="btn btn--ghost" href="index.html#pillars">كل المحاور</a></p>
        </div>
      </section>`;

    return header("") + `<main id="main">${body}</main>` + footer();
  }

  /* ---------- التشغيل ---------- */
  function boot() {
    const page = document.body.dataset.page;
    document.body.innerHTML = page === "pillar" ? renderPillar() : renderHome();

    // قائمة الجوال
    const btn = $(".nav-toggle"), nav = $("#nav");
    if (btn && nav) {
      btn.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      });
    }

    // ظهور تدريجي
    const items = document.querySelectorAll(".reveal");
    if (!window.IntersectionObserver || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    items.forEach((n) => io.observe(n));
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
