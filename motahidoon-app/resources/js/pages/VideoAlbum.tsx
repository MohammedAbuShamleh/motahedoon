import { Link } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { AlbumGrid, FeaturePlaylist } from "@/components/video";
import { useSite, useU } from "@/lib/site";
import type { VideoAlbumCard, VideoAlbumFull } from "@/types";

/* =====================================================================
   صفحة ألبوم (/videos/{slug}): رجوع إلى المكتبة، واسم الألبوم ووصفه
   وعدد مقاطعه، ثم المشغّل والقائمة، ثم الألبومات الأخرى.
   ===================================================================== */
export default function VideoAlbum({ album, others }: { album: VideoAlbumFull; others: VideoAlbumCard[] }) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);

  return (
    <Layout active="videos">
      <section className="band vpage">
        <div className="vpage__in reveal">
          <Link className="pa-back" href={path("/videos")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            {U("مكتبة الفيديو")}
          </Link>
          <header className="vpage__head">
            <h1 className="vpage__title">{album.title}</h1>
            <p className="vpage__facts">
              <span><b>{album.count}</b> {U(album.count === 1 ? "مقطع" : "مقاطع")}</span>
            </p>
          </header>
          {album.description && <p className="vpage__lead">{album.description}</p>}

          <FeaturePlaylist videos={album.videos} showAlbum={false} />
        </div>
      </section>

      {others.length > 0 && (
        <section className="band vpage vpage--latest">
          <div className="vpage__in reveal">
            <h2 className="vpage__h">{U("ألبومات أخرى")}</h2>
            <AlbumGrid albums={others} />
          </div>
        </section>
      )}
    </Layout>
  );
}
