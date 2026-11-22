import { Link } from "@inertiajs/react";
import { Fact, Section, SectionHead } from "@/components/primitives";
import { FeaturePlaylist } from "@/components/video";
import { useSite, useU } from "@/lib/site";
import type { VideoItem } from "@/types";

/* ---------- مكتبة الفيديو في الرئيسية ----------
   (بطلب صاحب المشروع 2026-11-22: قبل «المؤسسات الشريكة») مشغّل كبير في
   جهة البدء وقائمة مرقّمة في الأخرى — المميّزة فالأحدث، ستّة على الأكثر —
   ثم رابط المكتبة كاملةً. على الورق، تخالف هيئته الافتتاحيةَ و«من الميدان»:
   لا صورة بعرض الشاشة ولا شريط متحرّك. بلا مقاطع منشورة لا قسم. */
export function Videos({ videos }: { videos: VideoItem[] }) {
  const U = useU();
  const { locale } = useSite();
  if (!videos.length) return null;
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);

  return (
    <Section
      id="videos"
      cls="vsec"
      head={
        <SectionHead
          title={U("مكتبة الفيديو")}
          side={
            <>
              <Fact value={String(videos.length)} label={U("مقاطع مختارة")} />
              <Link className="btn btn--ghost" href={path("/videos")}>{U("المكتبة كاملة")}</Link>
            </>
          }
        />
      }
    >
      <FeaturePlaylist videos={videos} />
    </Section>
  );
}
