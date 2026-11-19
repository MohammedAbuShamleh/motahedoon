import { Head } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Card, DeleteButton, LinkButton, PageHeader } from "../../components/ui";

type User = { id: number; name: string; email: string; role: string; role_label: string };

export default function Index({ users }: { users: User[] }) {
  return (
    <AdminLayout>
      <Head title="المستخدمون" />
      <PageHeader title="المستخدمون" subtitle="مدير: كل شيء · محرّر: المحتوى · مترجم: الترجمات وحدها." actions={<LinkButton href="/admin/users/create" variant="primary">+ مستخدم</LinkButton>} />
      <Card flush>
        <ul className="divide-y divide-rule">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
              {/* الحرف الأوّل في مربّع ليّن — لا صورة شخصية مدوّرة */}
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-olive/10 text-sm font-black text-olive">{u.name.trim().charAt(0)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{u.name}</p>
                <p className="mt-0.5 text-xs text-ink/60"><span dir="ltr">{u.email}</span></p>
              </div>
              <Badge tone={u.role === "admin" ? "olive" : "neutral"}>{u.role_label}</Badge>
              <div className="flex gap-2">
                <LinkButton href={`/admin/users/${u.id}/edit`} size="sm">تحرير</LinkButton>
                <DeleteButton small url={`/admin/users/${u.id}`} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </AdminLayout>
  );
}
