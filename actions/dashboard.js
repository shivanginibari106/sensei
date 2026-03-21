"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) return { needsOnboarding: true };

  return {
    needsOnboarding: false,
    user: {
      industry: user.industry,
      skills: user.skills,
      experience: user.experience,
    },
    insight: user.industryInsight,
  };
}
