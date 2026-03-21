"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateContent } from "@/lib/gemini";

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const resume = await db.resume.upsert({
    where: { userId },
    create: { userId, content },
    update: { content },
  });

  revalidatePath("/resume");
  return resume;
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.resume.findUnique({ where: { userId } });
}

export async function improveWithAI({ current, type, userInfo }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true },
  });

  const prompt = `
    You are an expert resume writer for ${user?.industry || "technology"} industry.
    Improve the following ${type} content to be ATS-optimized, impactful, and concise.
    Use strong action verbs and include quantifiable results where possible.
    
    Current content: "${current}"
    User skills context: ${(user?.skills || []).join(", ")}
    
    Return ONLY the improved text, no explanation or formatting.
  `;

  return generateContent(prompt);
}
