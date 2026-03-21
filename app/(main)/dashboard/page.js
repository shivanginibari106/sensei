import { redirect } from "next/navigation";
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_components/dashboard-view";

export default async function DashboardPage() {
  const data = await getIndustryInsights();

  if (data.needsOnboarding) redirect("/onboarding");

  return <DashboardView data={data} />;
}
