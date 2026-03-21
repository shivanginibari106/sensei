import { serve } from "inngest/next";
import { inngest, updateIndustryInsights } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [updateIndustryInsights],
});
