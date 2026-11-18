import { Head } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Card, DeleteButton, LinkButton, PageHeader } from "../../components/ui";

type User = { id: number; name: string; email: string; role: string; role_label: string };

export default function Index({ users }: { users: User[] }) {
  return (
    <AdminLayout>
      <Head title="المستخدمون" />
      <PageHeader title="المستخدمون" subtitle="مدير: كل شيء · محرّر: المحتوى · مترجم: الترجمات وحدها." actions={<LinkButton href="/admin/users/create" variant="primary">+ مستخدم</LinkButton>} />
      <Card>
        <ul className="divide-y divide-rule">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-ink/60" dir="ltr">{u.email}</p>
              </div>
              <Badge tone={u.role === "admin" ? "olive" : "neutral"}>{u.role_label}</Badge>
              <LinkButton href={`/admin/users/${u.id}/edit`}>تحرير</LinkButton>
              <DeleteButton url={`/admin/users/${u.id}`} />
            </li>
          ))}
        </ul>
      </Card>
    </AdminLayout>
  );
}
