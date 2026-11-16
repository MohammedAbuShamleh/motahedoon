/* =====================================================================
   مُصدِّر المحتوى — من الموقع الثابت إلى JSON
   ---------------------------------------------------------------------
   ينقل data.js و en.js و tr.js حرفياً. لا يُطبع حرف من جديد، ولا يُعاد
   تنسيق رقم، ولا يُحذف حقل null — الخانات المحجوزة جزء من التصميم.

   الاستعمال:  node tools/export-content.mjs
   ===================================================================== */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "../../motahidoon-site/motahidoon-site/assets/js");
const OUT = resolve(here, "../resources/content");

/* data.js يصرّح `const SITE = {…};` — نُقيّمه في سياق معزول بدل تحليله
   بتعبير نمطي، فلا احتمال لسوء قراءة محرف هروب أو اقتباس داخل نصّ. */
function evalSite() {
  const src = readFileSync(resolve(SRC, "data.js"), "utf8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(src + "\n;globalThis.__out = SITE;", ctx);
  return ctx.__out;
}

/* ملفات اللغات تُسند إلى window.I18N.<code> */
function evalI18n(code) {
  const src = readFileSync(resolve(SRC, `i18n/${code}.js`), "utf8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx.window.I18N[code];
}

/* عدّ كل نصّ غير فارغ في الشجرة — رقم المرجع لمدقّق السلامة */
function countStrings(node, acc = { n: 0, chars: 0 }) {
  if (typeof node === "string") {
    if (node.trim()) { acc.n++; acc.chars += node.length; }
  } else if (Array.isArray(node)) {
    node.forEach((v) => countStrings(v, acc));
  } else if (node && typeof node === "object") {
    Object.values(node).forEach((v) => countStrings(v, acc));
  }
  return acc;
}

function countNulls(node, path = "", out = []) {
  if (node === null) { out.push(path); return out; }
  if (Array.isArray(node)) {
    node.forEach((v, i) => countNulls(v, `${path}[${i}]`, out));
  } else if (node && typeof node === "object") {
    Object.entries(node).forEach(([k, v]) => countNulls(v, path ? `${path}.${k}` : k, out));
  }
  return out;
}

const site = evalSite();
const en = evalI18n("en");
const tr = evalI18n("tr");

mkdirSync(OUT, { recursive: true });
const write = (name, data) =>
  writeFileSync(resolve(OUT, name), JSON.stringify(data, null, 2) + "\n", "utf8");

write("site.ar.json", site);
write("site.en.json", en);
write("site.tr.json", tr);

const a = countStrings(site);
const nulls = countNulls(site);
console.log(`العربية  : ${a.n} نصّاً · ${a.chars} حرفاً`);
console.log(`الإنجليزية: ${countStrings(en).n} نصّاً`);
console.log(`التركية  : ${countStrings(tr).n} نصّاً`);
console.log(`خانات محجوزة (null): ${nulls.length}`);
nulls.forEach((p) => console.log(`  · ${p}`));
console.log(`\nكُتبت في ${OUT}`);
