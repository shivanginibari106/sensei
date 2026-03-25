"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Get or create user credits
export async function getUserCredits() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  let credit = await db.credit.findUnique({ where: { userId: user.id } });

  if (!credit) {
    credit = await db.credit.create({
      data: { userId: user.id, balance: 3, freeUsed: 0 },
    });
  }

  return credit;
}

// Generate Image
export async function generateImage({ prompt, api }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  // Check credits
  let credit = await db.credit.findUnique({ where: { userId: user.id } });
  if (!credit) {
    credit = await db.credit.create({
      data: { userId: user.id, balance: 3, freeUsed: 0 },
    });
  }

  if (credit.balance <= 0) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  let resultUrl = null;

  try {
    if (api === "huggingface") {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: {
              seed: Math.floor(Math.random() * 1000000),
              num_inference_steps: 20,
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HuggingFace error: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      resultUrl = `data:image/jpeg;base64,${base64}`;

    } else if (api === "replicate") {
      // Use actual Replicate API
      const output = await replicate.run(
        "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
        {
          input: {
            prompt: prompt,
            num_outputs: 1,
            width: 512,
            height: 512,
          }
        }
      );
      resultUrl = output[0];

    } else if (api === "gemini") {
      // Gemini mock
      resultUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt).slice(0,20)}/512/512`;

    } else if (api === "llama") {
      // LLaMA mock  
      resultUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt).slice(0,20)}/512/512`;
    }

    // Deduct credit & save generation
    await db.credit.update({
      where: { userId: user.id },
      data: {
        balance: { decrement: 1 },
        freeUsed: { increment: 1 },
      },
    });

    await db.generation.create({
      data: {
        userId: user.id,
        type: "image",
        prompt,
        api,
        resultUrl,
        status: "completed",
      },
    });

    return { success: true, resultUrl };

  } catch (error) {
    if (error.message === "INSUFFICIENT_CREDITS") throw error;
    throw new Error("Generation failed: " + error.message);
  }
}

// Generate Video (Mock Veo + Replicate)
export async function generateVideo({ prompt, api }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  let credit = await db.credit.findUnique({ where: { userId: user.id } });
  if (!credit) {
    credit = await db.credit.create({
      data: { userId: user.id, balance: 3, freeUsed: 0 },
    });
  }

  if (credit.balance < 2) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  let resultUrl = null;

  try {
    if (api === "veo") {
      // Veo mock video - can't vary videos with picsum
      // Document as concept-level mock
      resultUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
    } else if (api === "replicate") {
      // Replicate mock
      resultUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt).slice(0,20)}/512/512`;
    }

    // Video costs 2 credits
    await db.credit.update({
      where: { userId: user.id },
      data: { balance: { decrement: 2 } },
    });

    await db.generation.create({
      data: {
        userId: user.id,
        type: "video",
        prompt,
        api,
        resultUrl,
        status: "completed",
      },
    });

    return { success: true, resultUrl };

  } catch (error) {
    if (error.message === "INSUFFICIENT_CREDITS") throw error;
    throw new Error("Generation failed: " + error.message);
  }
}

// Buy credits (dummy payment)
export async function purchaseCredits(amount) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  // Check if credit record exists
  let credit = await db.credit.findUnique({ where: { userId: user.id } });
  if (!credit) {
    credit = await db.credit.create({
      data: { userId: user.id, balance: amount, freeUsed: 0 },
    });
  } else {
    await db.credit.update({
      where: { userId: user.id },
      data: { balance: { increment: amount } },
    });
  }

  return { success: true, added: amount };
}

// Get generation history
export async function getGenerations() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return db.generation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}