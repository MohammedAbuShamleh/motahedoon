import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useSite, useU } from "@/lib/site";
import type { VideoAlbumCard, VideoItem } from "@/types";

/* =====================================================================
   مكوّنات مكتبة الفيديو — قسم الرئيسية وصفحتا المكتبة والألبوم.

   المشغّل «واجهة قبل التحميل»: غلاف وزرّ تشغيل وحدهما، ولا يُحمَّل
   iframe يوتيوب/فيسبوك ولا يُجلب ملف الفيديو إلا بعد نقر الزائر — صفحة
   خفيفة لاتصال ضعيف، ولا ملفّات تتبّع قبل التشغيل (youtube-nocookie).
   الغلاف محتوًى كاملاً بنسبته (لا قصّ) على أرضية حبرية.
   ===================================================================== */

const pad = (n: number) => String(n).padStart(2, "0");

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
  );
}

/** المشغّل: الغلاف حتى النقر، ثم المقطع نفسه في مكانه. */
export function VideoPlayer({ video, playing, onPlay }: {
  video: VideoItem; playing: boolean; onPlay: () => void;
}) {
  const U = useU();
  return (
    <div className="vplayer">
      {playing ? (
        video.kind === "file" && video.src ? (
          <video
            key={video.id}
            className="vplayer__media"
            src={video.src}
            poster={video.poster ?? undefined}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        ) : (
          <iframe
            key={video.id}
            className="vplayer__media"
            src={video.embed ?? ""}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )
      ) : (
        <button type="button" className="vplayer__facade" onClick={onPlay}
                aria-label={`${U("تشغيل")}: ${video.title}`}>
          {video.poster
            ? <img key={video.id} src={video.poster} alt="" decoding="async" />
            : <span className="vplayer__blank" aria-hidden="true" />}
          <span className="vplayer__play" aria-hidden="true"><PlayGlyph /></span>
          {video.duration && <span className="vplayer__dur" aria-hidden="true">{video.duration}</span>}
        </button>
      )}
    </div>
  );
}

/**
 * مشغّل كبير وقائمة مرقّمة بجانبه: النقر على سطر يشغّله في المشغّل نفسه.
 * يستعمله قسم الرئيسية وصفحة الألبوم وقسم «أحدث المقاطع» في المكتبة.
 */
export function FeaturePlaylist({ videos, showAlbum = true }: { videos: VideoItem[]; showAlbum?: boolean }) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);

  /* قائمة جديدة (تنقّل Inertia بين ألبومين): ابدأ من أوّلها، غير مشغَّلة */
  const ids = videos.map((v) => v.id).join(",");
  useEffect(() => { setAt(0); setPlaying(false); }, [ids]);

  const cur = videos[Math.min(at, videos.length - 1)];
  if (!cur) return null;

  return (
    <div className="vfp">
      <div className="vfp__main">
        <VideoPlayer video={cur} playing={playing} onPlay={() => setPlaying(true)} />
        <div className="vfp__info">
          <p className="vfp__meta">
            <span className="vfp__no">{pad(at + 1)} / {pad(videos.length)}</span>
            {showAlbum && (
              <Link className="vfp__album" href={path(`/videos/${cur.album.slug}`)}>{cur.album.title}</Link>
            )}
            {cur.date && <time className="vfp__date" dateTime={cur.date}>{cur.date}</time>}
          </p>
          <h3 className="vfp__title">{cur.title}</h3>
          {cur.description && <p className="vfp__desc">{cur.description}</p>}
        </div>
      </div>

      <ol className="vfp__list" aria-label={U("قائمة المقاطع")}>
        {videos.map((v, i) => (
          <li key={v.id}>
            <button
              type="button"
              className={i === at ? "vfp__row is-on" : "vfp__row"}
              aria-current={i === at ? "true" : undefined}
              onClick={() => { setAt(i); setPlaying(true); }}
            >
              <span className="vfp__n" aria-hidden="true">{pad(i + 1)}</span>
              <span className="vfp__thumb" aria-hidden="true">
                {v.poster ? <img src={v.poster} alt="" loading="lazy" decoding="async" /> : null}
                <span className="vfp__tplay"><PlayGlyph /></span>
              </span>
              <span className="vfp__rt">
                <span className="vfp__rtitle">{v.title}</span>
                <span className="vfp__rsub">
                  {showAlbum && <span>{v.album.title}</span>}
                  {v.duration && <span className="vfp__rdur">{v.duration}</span>}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** شبكة الألبومات: غلاف كامل بنسبته، والاسم، وعدد المقاطع. */
export function AlbumGrid({ albums }: { albums: VideoAlbumCard[] }) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);
  return (
    <ul className="valbums">
      {albums.map((a, i) => (
        <li key={a.slug} style={{ "--i": Math.min(i, 11) } as React.CSSProperties}>
          <Link className="valbum" href={path(`/videos/${a.slug}`)}>
            <span className="valbum__cover" aria-hidden="true">
              {a.cover ? <img src={a.cover} alt="" loading="lazy" decoding="async" /> : null}
              <span className="valbum__count"><PlayGlyph />{a.count}</span>
            </span>
            <span className="valbum__body">
              <span className="valbum__t">{a.title}</span>
              <span className="valbum__s">{a.count} {U(a.count === 1 ? "مقطع" : "مقاطع")}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
