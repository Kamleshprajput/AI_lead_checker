import { z } from "zod";

export const LeadAnalysisSchema = z.object({
  intent: z.string(),
  urgency: z.enum(["low", "medium", "high"]),
  primary_friction: z.enum([
    "budget_uncertainty",
    "choice_overload",
    "trust_validation",
    "timeline_pressure",
    "information_gap",
    "low_commitment"
  ]),
  lead_half_life_minutes: z.number(),
  confidence: z.number().min(0).max(1)
});

// 👇 ADD THIS
export type LeadAnalysis = z.infer<typeof LeadAnalysisSchema>;
