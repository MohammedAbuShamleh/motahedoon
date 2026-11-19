import { Head, useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";

/* صفحة الدخول — بطاقة رسمية بشقّين: النموذج على الورق، ولوح الهوية بالحبري
   وفيه الشعار على بلاطة ورقية بين كتلة خضراء ومربّع زيتوني (لغة «من نحن»
   وفصول صفحة التقرير). النصوص تسميات واجهة فقط، والاسم الرسمي من الهوية.
   لا دوائر: الزوايا كلّها مربّعات ليّنة، وبؤبؤ رمز العين معيّن.
   على الحبري النصّ ورقيّ وحده؛ الأخضر والزيتوني هناك مساحات وخطوط لا نصّ. */

const INPUT =
  "h-12 w-full rounded-lg border border-rule bg-paper px-3.5 text-[0.95rem] text-ink outline-none transition " +
  "focus:border-olive focus:ring-4 focus:ring-olive/15 aria-[invalid=true]:border-red/70";

export default function Login() {
  const form = useForm({ email: "", password: "", remember: false });
  const [shown, setShown] = useState(false);
  const year = new Date().getFullYear();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.post("/admin/login", { onFinish: () => form.reset("password") });
  };

  // خطأ الدخول يصل على حقل البريد ويخصّ الحقلين معاً، فيُعرض تنبيهاً فوق النموذج
  const error = form.errors.email ?? form.errors.password;

  return (
    <div className="grid min-h-screen place-items-center bg-rule/35 px-4 py-8 sm:py-12">
      <Head title="تسجيل الدخول" />

      <div className="w-full max-w-[58rem] overflow-hidden rounded-2xl border border-rule bg-paper shadow-[0_24px_60px_-28px_rgba(26,26,26,.35)] md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* لوح الهوية: شريط فوق النموذج على الجوال، وشقّ كامل على جهة النهاية في الشاشات الواسعة */}
        <aside className="bg-ink text-paper md:order-last md:flex md:flex-col">
          <div className="flex items-center gap-4 px-6 py-5 md:hidden">
            <span className="shrink-0 rounded-lg bg-paper p-2">
              <img src="/assets/img/logos/mutahidoon-mark.png" alt="" className="h-9 w-auto" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold">تجمع متحدون من أجل غزة</span>
              <span className="mt-1 block text-xs text-paper/70">لوحة التحكم</span>
            </span>
          </div>

          <div className="hidden flex-1 flex-col justify-between p-10 md:flex lg:p-12">
            <p className="flex items-center gap-3 text-sm font-semibold text-paper/80">
              <span aria-hidden="true" className="h-0.5 w-8 bg-green" />
              لوحة التحكم
            </p>
            <div className="relative mx-auto my-12 w-fit">
              <span aria-hidden="true" className="absolute -bottom-4 -end-4 h-3/5 w-3/5 rounded-2xl bg-green" />
              <span aria-hidden="true" className="absolute -start-4 -top-4 size-14 rounded-xl border-2 border-olive" />
              <div className="relative rounded-2xl bg-paper px-9 py-8">
                <img src="/assets/img/logos/mutahidoon-full.png" alt="شعار تجمع متحدون من أجل غزة" className="h-40 w-auto lg:h-44" />
              </div>
            </div>
            <p className="border-t border-paper/15 pt-5 text-sm text-paper/70">© {year} تجمع متحدون من أجل غزة</p>
          </div>
        </aside>

        <main className="px-6 py-9 sm:px-10 md:px-12 md:py-12">
          <p className="text-sm font-bold text-olive">لوحة تحكم متحدون</p>
          <h1 className="mt-2 text-[1.9rem] font-black leading-tight">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-ink/65">الدخول للمحرّرين والمترجمين</p>
          <span aria-hidden="true" className="mt-6 block h-px bg-rule" />

          {error && (
            <p role="alert" className="mt-6 rounded-lg border border-rule border-s-[3px] border-s-red bg-red/5 px-4 py-3 text-sm font-semibold">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold">البريد الإلكتروني</label>
              <input
                id="login-email"
                type="email"
                dir="ltr"
                autoComplete="username"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                required
                value={form.data.email}
                onChange={(e) => form.setData("email", e.target.value)}
                aria-invalid={form.errors.email ? true : undefined}
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold">كلمة المرور</label>
              {/* الحقل لاتيني الاتجاه: ps-12 تحجز يساره لزرّ الإظهار، وend-1 في السياق العربي يساراً أيضاً */}
              <div className="relative">
                <input
                  id="login-password"
                  type={shown ? "text" : "password"}
                  dir="ltr"
                  autoComplete="current-password"
                  required
                  value={form.data.password}
                  onChange={(e) => form.setData("password", e.target.value)}
                  aria-invalid={form.errors.password ? true : undefined}
                  className={`${INPUT} ps-12`}
                />
                <button
                  type="button"
                  onClick={() => setShown((v) => !v)}
                  aria-pressed={shown}
                  aria-label={shown ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute inset-y-1 end-1 grid w-10 place-items-center rounded-md text-ink/55 transition hover:text-olive"
                >
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                    <path d="M12 9l3 3-3 3-3-3z" />
                    {shown && <path d="M4 4l16 16" />}
                  </svg>
                </button>
              </div>
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.data.remember}
                onChange={(e) => form.setData("remember", e.target.checked)}
                className="size-4 accent-green"
              />
              تذكّرني على هذا الجهاز
            </label>

            <button
              type="submit"
              disabled={form.processing}
              className="h-12 w-full rounded-lg bg-green text-[0.95rem] font-bold text-paper transition hover:bg-olive disabled:opacity-60"
            >
              {form.processing ? "جارٍ الدخول…" : "دخول"}
            </button>
          </form>

          <a href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink/65 transition hover:text-olive">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            العودة إلى الموقع
          </a>
        </main>
      </div>
    </div>
  );
}
