import { Head, Link, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { TranslationFields } from "../../components/TranslationFields";
import {
  Badge, Card, DeleteButton, Empty, ErrorSummary, FileField, IndexChip, LinkButton, PageHeader, Select,
  SubmitBar, TextArea, TextField, Toggle,
} from "../../components/ui";
import { emptyTranslations, send, str } from "../../lib/form";
import type { MediaBrief, Translations } from "../../types";

type Video = {
  id: number; title: string; source: "url" | "file"; provider: string | null; duration: string | null;
  position: number; is_featured: boolean; is_published: boolean; thumb: string | null;
};
type Album = {
  id: number; slug: string; title: string; description: string | null; pillar_id: number | null;
  position: number; is_published: boolean; cover: MediaBrief; videos: Video[] | null; translations: Translations;
};

const SOURCE: Record<string, string> = { youtube: "يوتيوب", facebook: "فيسبوك" };

export default function Form({ album: a, pillars }: { album: Album | null; pillars: { id: number; title: string }[] }) {
  const form = useForm({
    slug: a?.slug ?? "", title: a?.title ?? "", description: str(a?.description),
    pillar_id: a?.pillar_id ? String(a.pillar_id) : "",
    position: a ? String(a.position) : "", is_published: a?.is_published ?? true,
    cover: null as File | null, remove_cover: false,
    translations: a?.translations ?? emptyTranslations(["title", "description"]),
  });
  const { data, setData } = form;
  const e = form.errors as Record<string, string | undefined>;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    send(form, a ? "put" : "post", a ? `/admin/video-albums/${a.id}` : "/admin/video-albums");
  };

  return (
    <AdminLayout>
      <Head title={a ? a.title : "ألبوم جديد"} />
      <PageHeader title={a ? a.title : "ألبوم جديد"} actions={<LinkButton href="/admin/video-albums">رجوع</LinkButton>} />
      <ErrorSummary errors={e} />
      <form onSubmit={submit} className="space-y-6">
        <Card title="بيانات الألبوم">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="اسم الألبوم" value={data.title} onChange={(v) => setData("title", v)} error={e.title} />
            <TextField label="المعرّف في الرابط" dir="ltr" value={data.slug} onChange={(v) => setData("slug", v)} error={e.slug} hint="حروف إنجليزية صغيرة وشرطات، مثل ramadan-2026 — يظهر في /videos/…" />
            <TextArea className="md:col-span-2" label="وصف قصير (اختياري)" value={data.description} onChange={(v) => setData("description", v)} error={e.description} />
            <Select
              label="مجال العمل (اختياري)"
              value={data.pillar_id}
              onChange={(v) => setData("pillar_id", v)}
              options={{ "": "— بلا مجال —", ...Object.fromEntries(pillars.map((p) => [String(p.id), p.title])) }}
              error={e.pillar_id}
            />
            <TextField label="الترتيب" type="number" dir="ltr" value={data.position} onChange={(v) => setData("position", v)} hint="اتركه فارغاً ليكون آخر الألبومات" />
            <FileField label="غلاف الألبوم (اختياري)" current={a?.cover ?? null} file={data.cover} remove={data.remove_cover}
              onFile={(f) => setData("cover", f)} onRemove={(v) => setData("remove_cover", v)} error={e.cover}
              hint="بدون غلاف يُستعمل غلاف أول مقطع. يُعرض كاملاً بنسبته." />
            <div className="flex items-center"><Toggle label="ظاهر في الموقع" checked={data.is_published} onChange={(v) => setData("is_published", v)} /></div>
          </div>
        </Card>
        <Card title="الترجمة الإنجليزية والتركية">
          <TranslationFields
            fields={[{ key: "title", label: "اسم الألبوم" }, { key: "description", label: "الوصف", multiline: true }]}
            value={data.translations}
            onChange={(t) => setData("translations", t)}
            errors={e}
          />
          <p className="mt-3 text-xs leading-6 text-ink/60">في الصفحتين الإنجليزية والتركية لا يظهر الألبوم إلا إن تُرجم اسمه — ولا يظهر بالعربية داخل صفحة أجنبية.</p>
        </Card>
        <SubmitBar processing={form.processing} />
      </form>

      {a && (
        <div className="mt-8">
          <Card
            title={`مقاطع الألبوم (${a.videos?.length ?? 0})`}
            actions={<LinkButton href={`/admin/video-albums/${a.id}/videos/create`} variant="primary" size="sm">+ إضافة مقطع</LinkButton>}
            flush
          >
            {!a.videos?.length ? <div className="p-5"><Empty>لا مقاطع بعد. الألبوم لا يظهر في الموقع حتى يضمّ مقطعاً منشوراً.</Empty></div> : (
              <ul className="divide-y divide-rule">
                {a.videos.map((v) => (
                  <li key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                    <IndexChip>{v.position}</IndexChip>
                    {v.thumb
                      ? <img src={v.thumb} alt="" className="aspect-video w-24 shrink-0 rounded-md border border-rule bg-ink object-contain" />
                      : <span aria-hidden="true" className="grid aspect-video w-24 shrink-0 place-items-center rounded-md border border-rule bg-ink text-xs text-paper/70">▶</span>}
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/videos/${v.id}/edit`} className="font-bold transition hover:text-green">{v.title}</Link>
                      <p className="mt-0.5 text-xs text-ink/55">
                        {v.source === "file" ? "ملف مرفوع" : SOURCE[v.provider ?? ""] ?? "رابط"}
                        {v.duration && <> · <span dir="ltr">{v.duration}</span></>}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {v.is_featured && <Badge tone="green">مميّز في الرئيسية</Badge>}
                      {!v.is_published && <Badge tone="red">مخفيّ</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <LinkButton href={`/admin/videos/${v.id}/edit`} size="sm">تحرير</LinkButton>
                      <DeleteButton small url={`/admin/videos/${v.id}`} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
