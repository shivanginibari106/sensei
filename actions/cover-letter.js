"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateContent } from "@/lib/gemini";

export async function generateCoverLetter({ jobTitle, companyName, jobDescription }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { name: true, industry: true, skills: true, experience: true, bio: true },
  });

  const prompt = `
    Write a professional cover letter for the following job:
    
    Job Title: ${jobTitle}
    Company: ${companyName}
    Job Description: ${jobDescription}
    
    Applicant info:
    - Industry: ${user?.industry}
    - Experience: ${user?.experience} years
    - Skills: ${(user?.skills || []).join(", ")}
    - Bio: ${user?.bio || "Experienced professional"}
    
    Format the letter in Markdown. Include placeholders like [Your Name], [Your Address], [Phone], [Email].
    Make it tailored, professional, and 3-4 paragraphs long. 
    Start with a strong opening that references the specific role.
    Return ONLY the cover letter markdown, no explanation.
  `;

  let content;
  try {
    content = await generateContent(prompt);
  } catch (e) {
    if (e.message && e.message.includes("429")) {
      return { error: "Failed to generate cover letter: API Limit Reached. Please try again later." };
    }
    return { error: `Failed to generate cover letter: ${e.message}` };
  }

  const letter = await db.coverLetter.create({
    data: {
      userId,
      content,
      jobTitle,
      companyName,
      jobDescription,
    },
  });

  revalidatePath("/ai-cover-letter");
  return letter;
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.coverLetter.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.coverLetter.delete({
    where: { id, userId },
  });

  revalidatePath("/ai-cover-letter");
}
