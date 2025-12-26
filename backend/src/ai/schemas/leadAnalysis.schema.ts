import { z } from "zod";

// Fixed enum values for deterministic output
export const IntentEnum = z.enum([
  "Pricing Information Request",
  "Sample Request",
  "Purchase Intent",
  "Technical Specification Inquiry",
  "Delivery Timeline Inquiry",
  "General Inquiry",
]);

export const UrgencyEnum = z.enum(["low", "medium", "high"]);

export const FrictionEnum = z.enum([
  "budget_uncertainty",
  "choice_overload",
  "trust_validation",
  "timeline_pressure",
  "information_gap",
  "low_commitment"
]);

export const LeadAnalysisSchema = z.object({
  intent: IntentEnum,
  urgency: UrgencyEnum,
  primary_friction: FrictionEnum,
  lead_half_life_minutes: z.number().int().min(30).max(1440),
  confidence: z.number().min(0).max(1)
});

export type LeadAnalysis = z.infer<typeof LeadAnalysisSchema>;

// Extended response with explainability
export const LeadAnalysisResponseSchema = LeadAnalysisSchema.extend({
  decision_reasons: z.array(z.string()),
  detected_signals: z.array(z.string()),
});

export type LeadAnalysisResponse = z.infer<typeof LeadAnalysisResponseSchema>;
