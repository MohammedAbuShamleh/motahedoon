import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";

/* مدخل اللوحة — منفصل عن site.tsx: لا يُحمَّل كود اللوحة في الموقع العام. */
createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<{ default: ComponentType }>("./admin/pages/**/*.tsx", { eager: true });
    const page = pages[`./admin/pages/${name.replace(/^Admin\//, "")}.tsx`];
    if (!page) throw new Error(`صفحة غير موجودة: ${name}`);
    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: { color: "#5C5B34" },
});
