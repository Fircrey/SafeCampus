import { redirect } from "next/navigation";

export const metadata = {
  title: "Reportar Situación · SafeCampus AI"
};

export default function ReportarRoute() {
  redirect("/reportar");
}
