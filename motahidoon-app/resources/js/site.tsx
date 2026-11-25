import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";

const LEGACY: Record<string, string> = { NotFound: "Error" };

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<{ default: ComponentType }>(
      "./pages/**/*.tsx",
      { eager: true },
    );
    /* أسماء قديمة: خادم لم يُحدَّث شيفرته بعد (أو مخبأ OPcache قديم) قد يطلب
       «NotFound» التي صارت «Error» — تُرسم صفحة الخطأ الجديدة لا صفحة بيضاء */
    const page = pages[`./pages/${LEGACY[name] ?? name}.tsx`];
    if (!page) throw new Error(`صفحة غير موجودة: ${name}`);
    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: { color: "#5C5B34" },   // الزيتوني، لا الافتراضي
});
