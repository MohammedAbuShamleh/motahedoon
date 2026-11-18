import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, ErrorSummary, LinkButton, PageHeader, Select, SubmitBar, TextField } from "../../components/ui";

type User = { id: number; name: string; email: string; role: string };

export default function Form({ user: u, roles }: { user: User | null; roles: Record<string, string> }) {
  const form = useForm({ name: u?.name ?? "", email: u?.email ?? "", role: u?.role ?? "editor", password: "" });
  const e = form.errors as Record<string, string | undefined>;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (u) form.put(`/admin/users/${u.id}`);
    else form.post("/admin/users");
  };

  return (
    <AdminLayout>
      <Head title={u ? u.name : "مستخدم جديد"} />
      <PageHeader title={u ? u.name : "مستخدم جديد"} actions={<LinkButton href="/admin/users">رجوع</LinkButton>} />
      <ErrorSummary errors={e} />
      <form onSubmit={submit}>
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="الاسم" value={form.data.name} onChange={(v) => form.setData("name", v)} error={e.name} />
            <TextField label="البريد" dir="ltr" type="email" value={form.data.email} onChange={(v) => form.setData("email", v)} error={e.email} />
            <Select label="الدور" value={form.data.role} onChange={(v) => form.setData("role", v)} options={roles} error={e.role} />
            <TextField label={u ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"} dir="ltr" type="password" value={form.data.password} onChange={(v) => form.setData("password", v)} error={e.password} hint="10 أحرف على الأقل." />
          </div>
        </Card>
        <SubmitBar processing={form.processing} />
      </form>
    </AdminLayout>
  );
}
