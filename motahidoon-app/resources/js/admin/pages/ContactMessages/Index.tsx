import { Head, router } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { Badge, Button, Card, DeleteButton, Empty, PageHeader, Pagination } from "../../components/ui";

type Message = {
  id: number; name: string; email: string | null; phone: string | null; message: string;
  locale: string; read: boolean; at: string | null;
};
type Paged = { data: Message[]; links: { url: string | null; label: string; active: boolean }[] };

const LANG: Record<string, string> = { ar: "العربية", en: "الإنجليزية", tr: "التركية" };

export default function Index({ messages, unread }: { messages: Paged; unread: number }) {
  const mark = (m: Message, read: boolean) =>
    router.put(`/admin/contact-messages/${m.id}`, { read }, { preserveScroll: true });

  return (
    <AdminLayout>
      <Head title="رسائل التواصل" />
      <PageHeader
        title="رسائل التواصل"
        subtitle={unread > 0 ? `${unread} رسالة غير مقروءة — من نموذج «تواصل معنا» في الموقع.` : "رسائل نموذج «تواصل معنا» في الموقع، الأحدث أوّلاً."}
      />
      <Card flush>
        {messages.data.length === 0 ? <div className="p-5"><Empty>لا رسائل بعد.</Empty></div> : (
          <ul className="divide-y divide-rule">
            {messages.data.map((m) => (
              <li key={m.id} className={`px-5 py-4 ${m.read ? "" : "bg-green/5"}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-bold">{m.name}</span>
                  {!m.read && <Badge tone="green">جديدة</Badge>}
                  <span className="text-xs text-ink/55">{LANG[m.locale] ?? m.locale}</span>
                  <span className="ms-auto text-xs text-ink/55" dir="ltr">{m.at}</span>
                </div>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {m.email && <a className="text-green hover:text-olive" dir="ltr" href={`mailto:${m.email}`}>{m.email}</a>}
                  {m.phone && <a className="text-green hover:text-olive" dir="ltr" href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}>{m.phone}</a>}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-ink/80">{m.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" type="button" onClick={() => mark(m, !m.read)}>
                    {m.read ? "وسم غير مقروءة" : "وسم مقروءة"}
                  </Button>
                  <DeleteButton small url={`/admin/contact-messages/${m.id}`} confirm="حذف الرسالة نهائياً؟" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="mt-4"><Pagination links={messages.links} /></div>
    </AdminLayout>
  );
}
