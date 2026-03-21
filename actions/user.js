"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateContent } from "@/lib/gemini";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    throw new Error("Could not resolve user email from Clerk profile");
  }

  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || undefined;

  await db.user.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      name,
      imageUrl: clerkUser.imageUrl ?? undefined,
      email,
    },
    update: {
      name,
      imageUrl: clerkUser.imageUrl ?? undefined,
      email,
    },
  });

  // Ensure industry insight exists
  const industry = `${data.industry}-${data.subIndustry}`;

  let insight = await db.industryInsight.findUnique({ where: { industry } });
  if (!insight) {
    insight = await generateIndustryInsights(industry);
  }

  const experience = Number.parseInt(String(data.experience), 10);
  const normalizedExperience = Number.isNaN(experience) ? 0 : experience;
  const normalizedSkills = Array.isArray(data.skills) ? data.skills.filter((s) => typeof s === "string" && s.trim().length > 0) : [];

  const updated = await db.user.update({
    where: { clerkUserId: userId },
    data: {
      industry,
      subIndustry: data.subIndustry,
      experience: normalizedExperience,
      bio: data.bio ?? "",
      skills: normalizedSkills,
    },
  });

  revalidatePath("/");
  return updated;
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true },
  });

  return {
    isOnboarded: !!user?.industry,
  };
}

async function generateIndustryInsights(industry) {
  const prompt = `
    Generate comprehensive industry insights for "${industry}" in JSON format.
    Return ONLY valid JSON with these exact keys:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "median": number, "max": number }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["string"],
      "marketOutlook": "string (1-2 sentences)",
      "keyTrends": ["string"],
      "recommendedSkills": ["string"]
    }
    Include 5-6 salary ranges for common roles, realistic salary numbers in USD thousands.
  `;

  try {
    const raw = await generateContent(prompt);
    const clean = raw.replace(/```json|```/g, "").trim();

    let data;
    try {
      data = JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("Invalid JSON response from generateContent");
      }
      data = JSON.parse(match[0]);
    }

    const nextUpdate = new Date();
    nextUpdate.setDate(nextUpdate.getDate() + 7);

    return await db.industryInsight.create({
      data: {
        industry,
        salaryRanges: data.salaryRanges,
        growthRate: data.growthRate,
        demandLevel: data.demandLevel,
        topSkills: data.topSkills,
        marketOutlook: data.marketOutlook,
        keyTrends: data.keyTrends,
        recommendedSkills: data.recommendedSkills,
        nextUpdate,
      },
    });
  } catch (e) {
    console.error("Failed to generate industry insights", e);
    const nextUpdate = new Date();
    nextUpdate.setDate(nextUpdate.getDate() + 1); // Retry tomorrow
    return await db.industryInsight.create({
      data: {
        industry,
        salaryRanges: [],
        growthRate: 0,
        demandLevel: "Medium",
        topSkills: [],
        marketOutlook: "Data temporarily unavailable due to high demand. We will update this shortly.",
        keyTrends: [],
        recommendedSkills: [],
        nextUpdate,
      },
    });
  }
}
