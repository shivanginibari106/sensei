"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateContent } from "@/lib/gemini";

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true, experience: true },
  });

  const prompt = `
    Generate 10 multiple-choice interview questions for a ${user?.industry || "technology"} professional
    with ${user?.experience || 2} years experience and skills in: ${(user?.skills || []).join(", ")}.
    
    Return ONLY valid JSON array:
    [
      {
        "question": "string",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A" | "B" | "C" | "D",
        "explanation": "string"
      }
    ]
    Make questions challenging but fair. Mix technical and behavioral questions.
  `;

  const raw = await generateContent(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function saveQuizResult({ questions, answers, score }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true },
  });

  // Generate improvement tip
  const wrongQuestions = questions.filter((q, i) => answers[i] !== q.correctAnswer);
  let improvementTip = null;

  if (wrongQuestions.length > 0) {
    const prompt = `
      Based on these incorrect interview answers:
      ${wrongQuestions.map((q) => `- ${q.question}`).join("\n")}
      
      Provide a concise (2-3 sentences) improvement tip for a ${user?.industry || "technology"} professional.
      Focus on the key areas to study. Return only the tip text.
    `;
    improvementTip = await generateContent(prompt);
  }

  const assessment = await db.assessment.create({
    data: {
      userId,
      quizScore: score,
      questions: questions.map((q, i) => ({
        ...q,
        userAnswer: answers[i],
        isCorrect: answers[i] === q.correctAnswer,
      })),
      category: user?.industry || "General",
      improvementTip,
    },
  });

  revalidatePath("/interview");
  return assessment;
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.assessment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
