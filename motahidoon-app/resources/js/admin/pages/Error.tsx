import { Head, Link } from "@inertiajs/react";

/* صفحة خطأ اللوحة: مستقلّة عن AdminLayout لأنها تُرسم أيضاً لزائر غير
   مسجَّل الدخول (رابط لوحة خاطئ). بلغة اللوحة: الحبري والورق والأخضر للإجراء. */

type Status = 403 | 404 | 419 | 429 | 500 | 503;

const COPY: Record<Status, { title: string; text: string }> = {
  404: { title: "الصفحة غير موجودة", text: "هذا الرابط لا يطابق أيّ صفحة في لوحة التحكم. ربما حُذف العنصر أو تغيّر رابطه." },
  403: { title: "لا تملك صلاحية هذه الصفحة", text: "دورك في اللوحة لا يسمح بفتح هذه الصفحة. اطلب الصلاحية من مدير الموقع." },
  419: { title: "انتهت صلاحية الجلسة", text: "مرّ وقت طويل منذ فتح الصفحة. حدّثها ثم أعد المحاولة؛ ما لم يُحفظ يحتاج إدخالاً من جديد." },
  429: { title: "محاولات كثيرة في وقت قصير", text: "انتظر دقيقة ثم أعد المحاولة." },
  500: { title: "حدث خطأ في الخادم", text: "تعذّر إتمام الطلب. أعد المحاولة بعد قليل، وإن تكرّر الخطأ فأبلغ المسؤول التقني." },
  503: { title: "الموقع قيد الصيانة", text: "اللوحة متوقّفة مؤقّتاً أثناء التحديث، وستعود خلال وقت قصير." },
};

export default function AdminError({ status }: { status: Status }) {
  const copy = COPY[status] ?? COPY[500];
  const retry = status === 419 || status === 429 || status === 500 || status === 503;

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4 py-12">
      <Head title={`${status} — ${copy.title}`} />
      <div className="w-full max-w-xl border border-ink bg-white">
        <div className="flex items-center gap-3 border-b border-ink bg-ink px-6 py-4 text-paper">
          <img src="/assets/img/logos/mutahidoon-mark.png" alt="" className="size-8 object-contain" />
          <span className="text-sm font-bold">لوحة التحكم — متحدون</span>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-olive">
            <span aria-hidden="true" className="inline-block size-2 rotate-45 bg-red" />
            خطأ <span dir="ltr">{status}</span>
          </p>
          <p dir="ltr" aria-hidden="true"
            className="mt-3 w-fit text-8xl font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:2px_var(--color-ink)] sm:text-9xl">
            {status}
          </p>
          <span aria-hidden="true" className="mt-5 block h-1 w-24 bg-red" />
          <h1 className="mt-7 text-2xl font-black">{copy.title}</h1>
          <p className="mt-3 text-sm leading-7 text-ink/70">{copy.text}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin" className="inline-flex h-10 items-center bg-green px-5 text-sm font-bold text-white transition hover:bg-ink">
              العودة إلى لوحة التحكم
            </Link>
            <button type="button" onClick={() => (retry ? window.location.reload() : window.history.back())}
              className="inline-flex h-10 items-center border border-rule bg-paper px-5 text-sm font-bold text-ink transition hover:border-ink">
              {retry ? "تحديث الصفحة" : "الرجوع للصفحة السابقة"}
            </button>
            <a href="/" className="inline-flex h-10 items-center px-2 text-sm font-bold text-ink/60 underline-offset-4 transition hover:text-green hover:underline">
              الموقع العام ↗
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
