import { Link } from "@inertiajs/react";
import { useState } from "react";
import { VideoPlayer } from "@/components/video";
import { useSite, useU } from "@/lib/site";
import type { VideoAlbumCard, VideoItem } from "@/types";

/* ---------- مكتبة الفيديو في الرئيسية: أرشيف تحريري ----------
   (2026-11-25، اتّجاه «الأرشيف التحريري» باختيار صاحب المشروع)
   على الورق الأبيض بالحبري، والأخضر للتشغيل وحده:
   · رأس مسطور: وسم «أرشيف مرئي» والعنوان، والأعداد، ورابط المكتبة.
   · المقطع المعروض في إطار شعري، وتحته لوح تعريف: رقمه كبيراً مفرَّغاً،
     والألبوم والتاريخ، والعنوان، والوصف.
   · «قائمة العرض» بجانبه: صفوف مرقّمة بالأبيض والأسود — المعروض أيضاً —
     تتلوّن عند المرور. المعروض موسوم بشريط حبري في جهة البدء يخضرّ عند المرور.
   · «حسب الألبوم» أسفل القسم: كلّ ألبوم بغلافه واسمه وعدده، رابطٌ إلى صفحته.
   تخالف الافتتاحية و«من الميدان»: لا صورة بعرض الشاشة ولا شريط متحرّك.
   بلا مقاطع منشورة لا قسم. */
const pad = (n: number) => String(n).padStart(2, "0");

export function Videos({ videos, albums }: { videos: VideoItem[]; albums: VideoAlbumCard[] }) {
  const U = useU();
  const { locale } = useSite();
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  if (!videos.length) return null;
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);
  const cur = videos[Math.min(at, videos.length - 1)];
  const total = albums.reduce((n, a) => n + a.count, 0);

  return (
    <section className="band varc" id="videos">
      <div className="varc__in reveal">
        <header className="varc__head">
          <div>
            <p className="varc__k">{U("أرشيف مرئي")}</p>
            <h2 className="h-sec">{U("مكتبة الفيديو")}</h2>
          </div>
          <div className="varc__side">
            <p className="varc__facts">
              {albums.length > 0 && <span><b>{albums.length}</b> {U("ألبومات")}</span>}
              <span><b>{total || videos.length}</b> {U("مقاطع")}</span>
            </p>
            <Link className="btn btn--ghost varc__all" href={path("/videos")}>{U("المكتبة كاملة")}</Link>
          </div>
        </header>

        <div className="varc__body">
          <figure className="varc__feat">
            <div className="varc__frame">
              <VideoPlayer video={cur} playing={playing} onPlay={() => setPlaying(true)} />
            </div>
            <figcaption className="varc__plate">
              <span className="varc__no" aria-hidden="true" dir="ltr">{pad(at + 1)}</span>
              <div className="varc__cap">
                <p className="varc__meta">
                  <Link className="varc__album" href={path(`/videos/${cur.album.slug}`)}>{cur.album.title}</Link>
                  {cur.date && <time dateTime={cur.date}>{cur.date}</time>}
                  {cur.duration && <span dir="ltr">{cur.duration}</span>}
                </p>
                <h3 className="varc__t">{cur.title}</h3>
                {cur.description && <p className="varc__d">{cur.description}</p>}
              </div>
            </figcaption>
          </figure>

          <nav className="varc__list" aria-label={U("قائمة العرض")}>
            <p className="varc__lh">
              <span>{U("قائمة العرض")}</span>
              <span dir="ltr">{pad(at + 1)} / {pad(videos.length)}</span>
            </p>
            <ol>
              {videos.map((v, i) => (
                <li key={v.id}>
                  <button type="button" className={i === at ? "varc__row is-on" : "varc__row"}
                    aria-current={i === at ? "true" : undefined}
                    onClick={() => { setAt(i); setPlaying(true); }}>
                    <span className="varc__n" aria-hidden="true" dir="ltr">{pad(i + 1)}</span>
                    <span className="varc__thumb" aria-hidden="true">
                      {v.poster ? <img src={v.poster} alt="" loading="lazy" decoding="async" /> : null}
                      {v.duration && <span className="varc__dur" dir="ltr">{v.duration}</span>}
                    </span>
                    <span className="varc__rt">
                      <span className="varc__rtitle">{v.title}</span>
                      <span className="varc__rsub">{v.album.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {albums.length > 1 && (
          <div className="varc__albums">
            <p className="varc__ah">{U("حسب الألبوم")}</p>
            <ul>
              {albums.map((a) => (
                <li key={a.slug}>
                  <Link className="varc__alb" href={path(`/videos/${a.slug}`)}>
                    <span className="varc__acov" aria-hidden="true">
                      {a.cover ? <img src={a.cover} alt="" loading="lazy" decoding="async" /> : null}
                    </span>
                    <span className="varc__at">{a.title}</span>
                    <span className="varc__ac"><b>{a.count}</b> {U("مقاطع")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
