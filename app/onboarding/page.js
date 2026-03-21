import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/actions/user";
import OnboardingForm from "./_components/onboarding-form";

export default async function OnboardingPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (isOnboarded) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-extrabold mb-2"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Welcome to Sensei 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us about yourself so we can personalize your experience.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
