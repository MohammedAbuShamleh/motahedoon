import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, ErrorSummary, LinkButton, PageHeader, SubmitBar, TextField } from "../../components/ui";
import { send } from "../../lib/form";

type Profile = { name: string; email: string; role: string; since: string | null };

/* الملف الشخصي: بيانات الحساب، وكلمة المرور — نموذجان منفصلان فلا يُرسَل
   أحدهما بأخطاء الآخر. للمدير بطاقة ثالثة إلى إدارة المستخدمين. */
export default function Edit({ profile: p, users }: { profile: Profile; users: number | null }) {
  const info = useForm({ name: p.name, email: p.email, current_password: "" });
  const pass = useForm({ current_password: "", password: "", password_confirmation: "" });
  const ie = info.errors as Record<string, string | undefined>;
  const pe = pass.errors as Record<string, string | undefined>;
  const emailChanged = info.data.email.trim() !== p.email;

  const saveInfo = (ev: FormEvent) => {
    ev.preventDefault();
    send(info, "put", "/admin/profile", () => info.setData("current_password", ""));
  };
  const savePass = (ev: FormEvent) => {
    ev.preventDefault();
    send(pass, "put", "/admin/profile/password", () => pass.reset());
  };

  return (
    <AdminLayout>
      <Head title="الملف الشخصي" />
      <PageHeader title="الملف الشخصي" subtitle={`${p.role}${p.since ? ` · منذ ${p.since}` : ""}`} />

      <div className="space-y-6">
        <form onSubmit={saveInfo} className="space-y-4">
          <ErrorSummary errors={ie} />
          <Card title="بيانات الحساب">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="الاسم" value={info.data.name} onChange={(v) => info.setData("name", v)} error={ie.name} />
              <TextField label="البريد الإلكتروني (اسم الدخول)" type="email" dir="ltr" value={info.data.email}
                onChange={(v) => info.setData("email", v)} error={ie.email} />
              {emailChanged && (
                <TextField className="md:col-span-2" label="كلمة المرور الحالية" type="password" dir="ltr"
                  value={info.data.current_password} onChange={(v) => info.setData("current_password", v)}
                  error={ie.current_password} hint="البريد هو اسم الدخول؛ تغييره يتطلّب كلمة المرور الحالية." />
              )}
            </div>
          </Card>
          <SubmitBar processing={info.processing} label="حفظ البيانات" />
        </form>

        <form onSubmit={savePass} className="space-y-4">
          <Card title="تغيير كلمة المرور">
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="كلمة المرور الحالية" type="password" dir="ltr" value={pass.data.current_password}
                onChange={(v) => pass.setData("current_password", v)} error={pe.current_password} />
              <TextField label="كلمة المرور الجديدة" type="password" dir="ltr" value={pass.data.password}
                onChange={(v) => pass.setData("password", v)} error={pe.password} hint="10 أحرف على الأقل." />
              <TextField label="تأكيد كلمة المرور الجديدة" type="password" dir="ltr" value={pass.data.password_confirmation}
                onChange={(v) => pass.setData("password_confirmation", v)} error={pe.password_confirmation} />
            </div>
          </Card>
          <SubmitBar processing={pass.processing} label="تغيير كلمة المرور" />
        </form>

        {users !== null && (
          <Card title="المستخدمون">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm leading-7 text-ink/75">
                في اللوحة <b>{users}</b> {users === 1 ? "مستخدم" : "مستخدمين"}. أضف محرّراً للمحتوى أو مترجماً، وحدّد دوره:
                <span className="block text-xs text-ink/55">المدير: كلّ شيء · المحرّر: المحتوى كلّه · المترجم: الترجمات ونصوص الواجهة وحدها.</span>
              </p>
              <div className="flex gap-2">
                <LinkButton href="/admin/users">كل المستخدمين</LinkButton>
                <LinkButton href="/admin/users/create" variant="primary">+ مستخدم جديد</LinkButton>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
