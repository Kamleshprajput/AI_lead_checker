export const leadAnalysisPrompt = `
Analyze this construction material inquiry.

INTENT (choose one): Pricing Information Request, Sample Request, Purchase Intent, Technical Specification Inquiry, Delivery Timeline Inquiry, General Inquiry

URGENCY (choose one): low, medium, high

PRIMARY_FRICTION (choose one): budget_uncertainty, choice_overload, trust_validation, timeline_pressure, information_gap, low_commitment

LEAD_HALF_LIFE_MINUTES: number (30-1440)

CONFIDENCE: number 0.0-1.0

Inquiry: "{lead}"
`;

export const leadAnalysisRetryPrompt = `
Re-analyze with higher precision. Use same enums.

INTENT: Pricing Information Request | Sample Request | Purchase Intent | Technical Specification Inquiry | Delivery Timeline Inquiry | General Inquiry
URGENCY: low | medium | high  
PRIMARY_FRICTION: budget_uncertainty | choice_overload | trust_validation | timeline_pressure | information_gap | low_commitment

Inquiry: "{lead}"
`;
