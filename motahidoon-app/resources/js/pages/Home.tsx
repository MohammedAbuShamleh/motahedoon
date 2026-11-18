import { Layout } from "@/app/Layout";
import { Hero } from "@/features/home/Hero";
import {
  About, AreasStrip, Fields, Filmstrip, Impact, Partners, Reports, Support,
} from "@/features/home/sections";
import type { ReportCard } from "@/features/home/sections";
import type { Founding, Identity, Partner, Pillar, Report } from "@/types";

interface Props {
  identity: Identity;
  founding: Founding;
  governance: string | null;
  partners: Partner[];
  pillars: Pillar[];
  fieldPhotos: string[];
  metricsCount: number;
  currentReport: Report | null;
  reports: ReportCard[];
}

export default function Home({
  identity, founding, governance, partners, pillars,
  fieldPhotos, metricsCount, currentReport, reports,
}: Props) {
  return (
    <Layout active="home">
      <Hero pillars={pillars} partnerCount={partners.length} />
      <AreasStrip pillars={pillars} />
      <About identity={identity} founding={founding} governance={governance} photo={fieldPhotos[1] ?? fieldPhotos[0] ?? null} />
      <Partners partners={partners} />
      <Fields pillars={pillars} />
      <Filmstrip photos={fieldPhotos} />
      {currentReport && <Impact report={currentReport} count={metricsCount} />}
      <Reports reports={reports} reportFile={currentReport?.reportFile ?? null} />
      <Support />
    </Layout>
  );
}
