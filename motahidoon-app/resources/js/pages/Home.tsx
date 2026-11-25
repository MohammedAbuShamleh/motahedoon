import { Layout } from "@/app/Layout";
import { Hero } from "@/features/home/Hero";
import {
  About, AreasStrip, Fields, Impact, Partners, Reports, Support,
} from "@/features/home/sections";
import { FieldGallery } from "@/features/home/Gallery";
import { Videos } from "@/features/home/Videos";
import type { ImpactReport, ReportCard } from "@/features/home/sections";
import type { Founding, Identity, Partner, Pillar, Report, VideoItem } from "@/types";

interface Props {
  identity: Identity;
  founding: Founding;
  governance: string | null;
  partners: Partner[];
  pillars: Pillar[];
  fieldPhotos: string[];
  videos: VideoItem[];
  metricsCount: number;
  currentReport: Report | null;
  impactReports: ImpactReport[];
  reports: ReportCard[];
}

export default function Home({
  identity, founding, governance, partners, pillars,
  fieldPhotos, videos, metricsCount, currentReport, impactReports, reports,
}: Props) {
  return (
    <Layout active="home">
      <Hero pillars={pillars} partnerCount={partners.length} />
      <AreasStrip pillars={pillars} />
      <About identity={identity} founding={founding} governance={governance} photo={fieldPhotos[1] ?? fieldPhotos[0] ?? null} />
      <Videos videos={videos} />
      <Partners partners={partners} />
      <Fields pillars={pillars} />
      <FieldGallery photos={fieldPhotos} />
      {impactReports.length > 0 && (
        <Impact reports={impactReports} currentId={currentReport?.id ?? null} count={metricsCount} />
      )}
      <Reports reports={reports} reportFile={currentReport?.reportFile ?? null} />
      <Support />
    </Layout>
  );
}
