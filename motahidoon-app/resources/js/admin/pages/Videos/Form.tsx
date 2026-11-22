import { Head, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { TranslationFields } from "../../components/TranslationFields";
import {
  Card, ErrorSummary, Field, FileField, LinkButton, PageHeader, SubmitBar, TextArea, TextField, Toggle, fileInputClass,
} from "../../components/ui";
import { emptyTranslations, send, str } from "../../lib/form";
import type { MediaBrief, Translations } from "../../types";

type Video = {
  id: number; title: string; description: string | null; source: "url" | "file"; url: string | null;
  provider: string | null; duration: string | null; recorded_on: string | null; position: number;
  is_featured: boolean; is_published: boolean; file: MediaBrief; poster: MediaBrief; thumb: string | null;
  translations: Translations;
};

export default function Form({ album, video: v, maxMb }: {
  album: { id: number; title: string }; video: Video | null; maxMb: number;
}) {
  const form = useForm({
    title: v?.title ?? "", description: str(v?.description),
    source: v?.source ?? ("url" as "url" | "file"), url: str(v?.url),
    file: null as File | null,
    poster: null as File | null, remove_poster: false,
    duration: str(v?.duration), recorded_on: str(v?.recorded_on),
    position: v ? String(v.position) : "",
    is_featured: v?.is_featured ?? false, is_published: v?.is_published ?? true,
    translations: v?.translations ?? emptyTranslations(["title", "description"]),
  });
  const { data, setData } = form;
  const e = form.errors as Record<string, string | undefined>;
  const back = `/admin/video-albums/${album.id}/edit`;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    send(form, v ? "put" : "post", v ? `/admin/videos/${v.id}` : `/admin/video-albums/${album.id}/videos`);
  };

  const tab = (value: "url" | "file", label: string) => (
    <button
      type="button"
      onClick={() => setData("source", value)}
      aria-pressed={data.source === value}
      className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
        data.source === value ? "border-ink bg-ink text-paper" : "border-rule bg-paper text-ink hover:border-ink"}`}
    >
      {label}
    </button>
  );

  return (
    <AdminLayout>
      <Head title={v ? v.title : "مقطع جديد"} />
      <PageHeader title={v ? v.title : "مقطع جديد"} subtitle={`في ألبوم «${album.title}»`} actions={<><LinkButton href="/admin/video-albums/guide">الدليل</LinkButton><LinkButton href={back}>رجوع إلى الألبوم</LinkButton></>} />
      <ErrorSummary errors={e} />
      <form onSubmit={submit} className="space-y-6">
        <Card title="المصدر">
          <div className="mb-4 flex flex-wrap gap-2">
            {tab("url", "رابط يوتيوب أو فيسبوك")}
            {tab("file", "ملف مرفوع")}
          </div>
          {data.source === "url" ? (
            <TextField
              label="رابط المقطع" dir="ltr" value={data.url} onChange={(x) => setData("url", x)} error={e.url}
              placeholder="https://www.youtube.com/watch?v=…"
              hint="يوتيوب (عادي أو Shorts) أو فيسبوك. الغلاف يُجلب تلقائياً من يوتيوب؛ لفيسبوك ارفع صورة غلاف أدناه."
            />
          ) : (
            <Field as="div" label="ملف الفيديو" error={e.file} hint={`MP4 أو WebM أو MOV، حتى ${maxMb} ميغابايت. للمقاطع الطويلة الرابط أخفّ على الخادم وعلى الزائرين.`}>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-rule bg-rule/20 p-3">
                {v?.file && !data.file && (
                  <a href={v.file.url} target="_blank" rel="noreferrer" className="rounded-md border border-rule bg-paper px-3 py-2 text-xs font-bold text-green">الملف الحالي</a>
                )}
                <input type="file" accept="video/mp4,video/webm,video/quicktime" aria-label="ملف الفيديو"
                  onChange={(ev) => setData("file", ev.target.files?.[0] ?? null)} className={fileInputClass} />
                {data.file && <span className="text-xs text-ink/60" dir="ltr">{(data.file.size / 1048576).toFixed(1)} MB</span>}
              </div>
            </Field>
          )}
          {form.progress && <p className="mt-3 text-xs font-bold text-ink/70">جارٍ الرفع… {form.progress.percentage}%</p>}
        </Card>

        <Card title="بيانات المقطع">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField className="md:col-span-2" label="العنوان" value={data.title} onChange={(x) => setData("title", x)} error={e.title} />
            <TextArea className="md:col-span-2" label="وصف قصير (اختياري)" value={data.description} onChange={(x) => setData("description", x)} error={e.description} />
            <TextField label="المدّة (اختياري)" dir="ltr" value={data.duration} onChange={(x) => setData("duration", x)} error={e.duration} placeholder="4:12" hint="كما تُكتب: 4:12 أو 1:04:12" />
            <TextField label="تاريخ التصوير (اختياري)" type="date" dir="ltr" value={data.recorded_on} onChange={(x) => setData("recorded_on", x)} error={e.recorded_on} />
            <FileField label="صورة الغلاف (اختياري)" current={v?.poster ?? null} file={data.poster} remove={data.remove_poster}
              onFile={(f) => setData("poster", f)} onRemove={(x) => setData("remove_poster", x)} error={e.poster}
              hint="ليوتيوب يكفي غلافه التلقائي؛ لفيسبوك والملفات يُستحسن غلاف. يُعرض كاملاً بنسبته." />
            <TextField label="الترتيب في الألبوم" type="number" dir="ltr" value={data.position} onChange={(x) => setData("position", x)} hint="اتركه فارغاً ليكون آخر المقاطع" />
            <div className="flex flex-col gap-3 md:col-span-2">
              <Toggle label="مميّز في قسم الرئيسية" checked={data.is_featured} onChange={(x) => setData("is_featured", x)} hint="المقاطع المميّزة تتقدّم القائمة في الرئيسية، ثم الأحدث." />
              <Toggle label="ظاهر في الموقع" checked={data.is_published} onChange={(x) => setData("is_published", x)} />
            </div>
          </div>
        </Card>

        <Card title="الترجمة الإنجليزية والتركية">
          <TranslationFields
            fields={[{ key: "title", label: "العنوان" }, { key: "description", label: "الوصف", multiline: true }]}
            value={data.translations}
            onChange={(t) => setData("translations", t)}
            errors={e}
          />
          <p className="mt-3 text-xs leading-6 text-ink/60">في الصفحتين الإنجليزية والتركية لا يظهر المقطع إلا إن تُرجم عنوانه.</p>
        </Card>
        <SubmitBar processing={form.processing} />
      </form>
    </AdminLayout>
  );
}
