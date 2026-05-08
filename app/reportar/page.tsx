import { ReportarPage } from "@/components/reportar/ReportarPage";

export const metadata = { title: "Crear Reporte · SafeCampus AI" };

export default async function ReportarRoute({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>;
}) {
  const params = await searchParams;
  return <ReportarPage initialZoneId={params.zone ?? null} />;
}
