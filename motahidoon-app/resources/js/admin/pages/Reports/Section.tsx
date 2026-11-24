import { Head } from "@inertiajs/react";
import { AdminLayout } from "../../components/AdminLayout";
import { SectionEditor, type Section } from "../../components/SectionEditor";
import { LinkButton, PageHeader } from "../../components/ui";

export default function SectionPage({ section: s }: { section: Section }) {
  return (
    <AdminLayout>
      <Head title={`${s.pillar} — ${s.report.label}`} />
      <PageHeader title={s.pillar} subtitle={`قسم في ${s.report.label}`} actions={<><LinkButton href="/admin/pillars/guide">الدليل</LinkButton><LinkButton href={`/admin/reports/${s.report.id}/edit`}>رجوع للتقرير</LinkButton></>} />
      <SectionEditor section={s} />
    </AdminLayout>
  );
}
