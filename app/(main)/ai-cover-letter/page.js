import { getCoverLetters } from "@/actions/cover-letter";
import CoverLetterDashboard from "./_components/cover-letter-dashboard";

export default async function CoverLetterPage() {
  const letters = await getCoverLetters();
  return <CoverLetterDashboard initialLetters={letters} />;
}
