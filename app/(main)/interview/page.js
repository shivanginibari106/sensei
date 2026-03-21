import { getAssessments } from "@/actions/interview";
import InterviewDashboard from "./_components/interview-dashboard";

export default async function InterviewPage() {
  const assessments = await getAssessments();
  return <InterviewDashboard assessments={assessments} />;
}
