import { Link } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { AlbumGrid, FeaturePlaylist } from "@/components/video";
import { useSite, useU } from "@/lib/site";
import type { VideoAlbumCard, VideoItem } from "@/types";

/* =====================================================================
   مكتبة الفيديو (/videos): رأس الصفحة بعدد الألبومات والمقاطع، ثم
   الألبومات شبكةً، ثم «أحدث المقاطع» بمشغّلها وقائمتها.
   ===================================================================== */
export default function Videos({ albums, latest }: { albums: VideoAlbumCard[]; latest: VideoItem[] }) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);
  const total = albums.reduce((n, a) => n + a.count, 0);

  return (
    <Layout active="videos">
      <section className="band vpage">
        <div className="vpage__in reveal">
          <Link className="pa-back" href={path("/")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            {U("العودة إلى الرئيسية")}
          </Link>
          <header className="vpage__head">
            <h1 className="vpage__title">{U("مكتبة الفيديو")}</h1>
            <p className="vpage__facts">
              <span><b>{albums.length}</b> {U("ألبومات")}</span>
              <span><b>{total}</b> {U("مقاطع")}</span>
            </p>
          </header>

          {albums.length ? (
            <>
              <h2 className="vpage__h">{U("الألبومات")}</h2>
              <AlbumGrid albums={albums} />
            </>
          ) : (
            <p className="vpage__empty">{U("لا مقاطع منشورة بعد")}</p>
          )}
        </div>
      </section>

      {latest.length > 0 && (
        <section className="band vpage vpage--latest">
          <div className="vpage__in reveal">
            <h2 className="vpage__h">{U("أحدث المقاطع")}</h2>
            <FeaturePlaylist videos={latest} />
          </div>
        </section>
      )}
    </Layout>
  );
}
