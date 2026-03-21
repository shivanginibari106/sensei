import { Inngest } from "inngest";
import { db } from "@/lib/prisma";
import { generateContent } from "@/lib/gemini";

export const inngest = new Inngest({ id: "sensei" });

export const updateIndustryInsights = inngest.createFunction(
  { id: "update-industry-insights", name: "Update Industry Insights Weekly" },
  { cron: "0 0 * * 0" }, // Every Sunday at midnight
  async ({ step }) => {
    const industries = await step.run("get-industries", async () => {
      return db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    const results = await Promise.allSettled(
      industries.map((i) =>
        step.run(`update-${i.industry}`, async () => {
          const prompt = `
            Generate updated industry insights for "${i.industry}" in 2025.
            Return ONLY valid JSON:
            {
              "salaryRanges": [{ "role": "string", "min": number, "median": number, "max": number }],
              "growthRate": number,
              "demandLevel": "High" | "Medium" | "Low",
              "topSkills": ["string"],
              "marketOutlook": "string",
              "keyTrends": ["string"],
              "recommendedSkills": ["string"]
            }
          `;

          const raw = await generateContent(prompt);
          const clean = raw.replace(/```json|```/g, "").trim();
          const data = JSON.parse(clean);

          const nextUpdate = new Date();
          nextUpdate.setDate(nextUpdate.getDate() + 7);

          return db.industryInsight.update({
            where: { industry: i.industry },
            data: {
              ...data,
              lastUpdated: new Date(),
              nextUpdate,
            },
          });
        })
      )
    );

    return {
      updated: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };
  }
);
