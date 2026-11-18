import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

/* مدخلان منفصلان عمداً:
   - site : الواجهة العامة. style.css المُعايَر يدوياً، بلا Tailwind.
   - admin: لوحة التحكم لاحقاً، Tailwind وحده.
   الفصل يمنع preflight الخاص بـTailwind من أن يمسّ تباين الواجهة
   العامة المُدقَّق. */
export default defineConfig({
  plugins: [
    laravel({
      input: [
        "resources/css/style.css", "resources/js/site.tsx",
        "resources/css/admin.css", "resources/js/admin.tsx",
      ],
      refresh: true,
    }),
    react(),
    // Tailwind يعالج admin.css وحده (الملف الوحيد الذي يستورده)؛ style.css لا يمسّه
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": resolve(import.meta.dirname, "resources/js") },
  },
  server: {
    watch: { ignored: ["**/storage/framework/views/**"] },
  },
});
