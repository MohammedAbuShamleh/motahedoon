import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/* مدخلان منفصلان عمداً:
   - site : الواجهة العامة. style.css المُعايَر يدوياً، بلا Tailwind.
   - admin: لوحة التحكم لاحقاً، Tailwind وحده.
   الفصل يمنع preflight الخاص بـTailwind من أن يمسّ تباين الواجهة
   العامة المُدقَّق. */
export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/style.css", "resources/js/site.tsx"],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: { "@": resolve(import.meta.dirname, "resources/js") },
  },
  server: {
    watch: { ignored: ["**/storage/framework/views/**"] },
  },
});
