import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { Button, TextField, Toggle } from "../../components/ui";

export default function Login() {
  const form = useForm({ email: "", password: "", remember: false });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.post("/admin/login", { onFinish: () => form.reset("password") });
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Head title="الدخول" />
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-rule bg-white p-7 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <img src="/assets/img/logos/mutahidoon-mark.png" alt="" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold">لوحة تحكم متحدون</h1>
            <p className="text-xs text-ink/60">الدخول للمحرّرين والمترجمين</p>
          </div>
        </div>
        <TextField label="البريد الإلكتروني" type="email" dir="ltr" value={form.data.email} onChange={(v) => form.setData("email", v)} error={form.errors.email} required />
        <TextField label="كلمة المرور" type="password" dir="ltr" value={form.data.password} onChange={(v) => form.setData("password", v)} error={form.errors.password} required />
        <Toggle label="تذكّرني على هذا الجهاز" checked={form.data.remember} onChange={(v) => form.setData("remember", v)} />
        <Button type="submit" disabled={form.processing} className="w-full">{form.processing ? "…" : "دخول"}</Button>
      </form>
    </div>
  );
}
