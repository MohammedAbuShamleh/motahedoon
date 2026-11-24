import { Link } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSite, useU } from "@/lib/site";
import type { VideoAlbumCard, VideoItem } from "@/types";

/* =====================================================================
   مكوّنات مكتبة الفيديو — قسم الرئيسية وصفحتا المكتبة والألبوم.
   الرئيسية: مشغّل وقائمة (FeaturePlaylist). الصفحتان: فهرس مركز إعلامي —
   تبويبات بالألبومات وشبكة بطاقات، والتشغيل في مسرح فوق الصفحة (VideoIndex).

   المشغّل «واجهة قبل التحميل»: غلاف وزرّ تشغيل وحدهما، ولا يُحمَّل
   iframe يوتيوب/فيسبوك ولا يُجلب ملف الفيديو إلا بعد نقر الزائر — صفحة
   خفيفة لاتصال ضعيف، ولا ملفّات تتبّع قبل التشغيل (youtube-nocookie).
   الغلاف يملأ إطار 16:9 (cover) بلا حواشٍ سوداء.
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

/* ---------- فهرس المقاطع: تبويبات وشبكة ومسرح ---------- */

/** بطاقة مقطع: الغلاف كاملاً بنسبته، ثم الألبوم والتاريخ، ثم العنوان. */
function VideoCard({ video, showAlbum, onOpen }: {
  video: VideoItem; showAlbum: boolean; onOpen: (el: HTMLButtonElement) => void;
}) {
  const U = useU();
  return (
    <button type="button" className="vcard" onClick={(e) => onOpen(e.currentTarget)}
            aria-label={`${U("تشغيل")}: ${video.title}`}>
      <span className="vcard__shot" aria-hidden="true">
        {video.poster
          ? <img src={video.poster} alt="" loading="lazy" decoding="async" />
          : <span className="vplayer__blank" />}
        <span className="vcard__play"><PlayGlyph /></span>
        {video.duration && <span className="vcard__dur">{video.duration}</span>}
      </span>
      <span className="vcard__body" aria-hidden="true">
        {(showAlbum || video.date) && (
          <span className="vcard__meta">
            {showAlbum && <span>{video.album.title}</span>}
            {video.date && <time dateTime={video.date}>{video.date}</time>}
          </span>
        )}
        <span className="vcard__t">{video.title}</span>
      </span>
    </button>
  );
}

/**
 * فهرس المقاطع. albums (اختياري) يُظهر تبويبات تصفّي الشبكة في مكانها —
 * «الكل» ثم ألبوم لكلّ تبويب بعدد مقاطعه. النقر على بطاقة يفتح المسرح،
 * والتنقّل فيه داخل المقاطع الظاهرة في التبويب الحالي وحدها.
 */
export function VideoIndex({ videos, albums, showAlbum = true }: {
  videos: VideoItem[]; albums?: VideoAlbumCard[]; showAlbum?: boolean;
}) {
  const U = useU();
  const [tab, setTab] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const shown = tab === null ? videos : videos.filter((v) => v.album.slug === tab);
  const album = albums?.find((a) => a.slug === tab);
  const tabs = albums && albums.length > 1;

  const close = useCallback(() => { setOpen(null); opener.current?.focus(); }, []);

  return (
    <>
      {tabs && (
        <div className="vtabs" role="tablist" aria-label={U("تصنيف المقاطع")}>
          {[{ slug: null, title: U("الكل"), count: videos.length }, ...albums.map((a) => ({ slug: a.slug as string | null, title: a.title, count: a.count }))]
            .map((t) => (
              <button key={t.slug ?? "all"} type="button" role="tab" className="vtabs__t"
                      aria-selected={tab === t.slug} onClick={() => setTab(t.slug)}>
                {t.title}<span className="vtabs__n"><bdi>{t.count}</bdi></span>
              </button>
            ))}
        </div>
      )}

      <div role={tabs ? "tabpanel" : undefined} aria-label={tabs ? (album?.title ?? U("الكل")) : undefined}>
        {album?.description && <p className="vindex__lead">{album.description}</p>}
        <ul key={tab ?? "all"} className="vindex">
          {shown.map((v, i) => (
            <li key={v.id} style={{ "--i": Math.min(i, 11) } as React.CSSProperties}>
              <VideoCard video={v} showAlbum={showAlbum && tab === null}
                         onOpen={(el) => { opener.current = el; setOpen(i); }} />
            </li>
          ))}
        </ul>
      </div>

      {open !== null && shown[open] && (
        <VideoTheater videos={shown} index={open} onIndex={setOpen} onClose={close} showAlbum={showAlbum} />
      )}
    </>
  );
}

/**
 * المسرح: المقطع يعمل فوق الصفحة على الحبري، بأزرار العارض نفسها
 * (إغلاق وسابق وتالٍ). يُغلق بـEsc أو بالنقر خارج المقطع، والأسهم
 * تتنقّل بالاتجاه البصري. التمرير مقفول ومكان شريطه محجوز فلا تنزاح الصفحة.
 */
function VideoTheater({ videos, index, onIndex, onClose, showAlbum }: {
  videos: VideoItem[]; index: number; onIndex: (i: number) => void; onClose: () => void; showAlbum: boolean;
}) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);
  const closeRef = useRef<HTMLButtonElement>(null);
  const n = videos.length;
  const cur = videos[index];
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);

  useEffect(() => {
    closeRef.current?.focus();
    const root = document.documentElement;
    const prev = document.body.style.overflow;
    const prevGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (n < 2) return;
      const rtl = root.dir === "rtl";
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      root.style.scrollbarGutter = prevGutter;
      document.removeEventListener("keydown", onKey);
    };
  }, [go, n, onClose]);

  return (
    <div className="vtheater" role="dialog" aria-modal="true" aria-label={cur.title} onClick={onClose}>
      <div className="vtheater__stage" onClick={(e) => e.stopPropagation()}>
        <VideoPlayer key={cur.id} video={cur} playing onPlay={() => {}} />
        <div className="vtheater__info">
          <p className="vtheater__meta">
            {n > 1 && <span className="vtheater__no"><bdi>{pad(index + 1)} / {pad(n)}</bdi></span>}
            {showAlbum && (
              <Link className="vtheater__album" href={path(`/videos/${cur.album.slug}`)}>{cur.album.title}</Link>
            )}
            {cur.date && <time className="vtheater__date" dateTime={cur.date}>{cur.date}</time>}
          </p>
          <h2 className="vtheater__title">{cur.title}</h2>
          {cur.description && <p className="vtheater__desc">{cur.description}</p>}
        </div>
      </div>

      <button ref={closeRef} type="button" className="lightbox__close" aria-label={U("إغلاق")} onClick={onClose}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {n > 1 && (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" aria-label={U("المقطع السابق")}
            onClick={(e) => { e.stopPropagation(); go(-1); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" aria-label={U("المقطع التالي")}
            onClick={(e) => { e.stopPropagation(); go(1); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
        </>
      )}
    </div>
  );
}
