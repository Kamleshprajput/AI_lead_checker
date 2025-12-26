import { LeadAnalysis } from "../ai/schemas/leadAnalysis.schema";

export function requiresHumanReview(
  analysis: LeadAnalysis
): boolean {
  return (
    analysis.confidence < 0.6 ||
    analysis.primary_friction === "trust_validation" ||
    analysis.lead_half_life_minutes <= 30
  );
}
