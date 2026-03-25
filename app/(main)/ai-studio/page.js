import { getUserCredits, getGenerations } from "@/actions/ai-studio";
import AIStudioClient from "./_components/ai-studio-client";

export default async function AIStudioPage() {
  const credits = await getUserCredits();
  const generations = await getGenerations();

  return (
    <AIStudioClient
      initialCredits={credits}
      initialGenerations={generations}
    />
  );
}