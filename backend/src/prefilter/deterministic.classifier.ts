/**
 * Deterministic Pre-Filter
 *
 * Lightweight rule-based classifier that detects high-confidence patterns
 * before making expensive LLM calls. Returns structured analysis when
 * confidence is high enough to skip AI inference.
 */

import { LeadAnalysis } from "../ai/schemas/leadAnalysis.schema";

export interface PreFilterResult {
  shouldSkipLLM: boolean;
  analysis?: LeadAnalysis;
  confidence: number;
  reasons: string[];
  signals: string[];
}

// =====================
// Fixed enum values
// =====================

const INTENT_OPTIONS = [
  "Pricing Information Request",
  "Sample Request",
  "Purchase Intent",
  "Technical Specification Inquiry",
  "Delivery Timeline Inquiry",
  "General Inquiry",
] as const;

const URGENCY_OPTIONS = ["low", "medium", "high"] as const;

const FRICTION_OPTIONS = [
  "budget_uncertainty",
  "choice_overload",
  "trust_validation",
  "timeline_pressure",
  "information_gap",
  "low_commitment",
] as const;

// =====================
// Derived literal types
// =====================

type Intent = typeof INTENT_OPTIONS[number];
type Urgency = typeof URGENCY_OPTIONS[number];
type Friction = typeof FRICTION_OPTIONS[number];

// =====================
// Classifier
// =====================

export function deterministicClassifier(message: string): PreFilterResult {
  const lowerMessage = message.toLowerCase().trim();
  const reasons: string[] = [];
  const signals: string[] = [];

  // Basic message characteristics
  const messageLength = message.length;
  const hasQuestions = (message.match(/\?/g) || []).length > 0;
  const hasExclamation = message.includes("!");

  // =====================
  // URGENCY DETECTION
  // =====================

  let urgency: Urgency = "low";
  let urgencyConfidence = 0.5;

  const highUrgencyKeywords = [
    "urgent",
    "asap",
    "as soon as possible",
    "immediately",
    "right now",
    "emergency",
    "critical",
    "deadline",
    "today",
    "within hours",
    "rush",
    "expedited",
    "fast",
    "quickly",
  ];

  const mediumUrgencyKeywords = [
    "soon",
    "need",
    "required",
    "looking for",
    "interested",
    "this week",
    "next week",
    "as soon as",
  ];

  const highUrgencyMatches = highUrgencyKeywords.filter((kw) =>
    lowerMessage.includes(kw)
  ).length;

  const mediumUrgencyMatches = mediumUrgencyKeywords.filter((kw) =>
    lowerMessage.includes(kw)
  ).length;

  if (highUrgencyMatches > 0 || (hasExclamation && hasQuestions)) {
    urgency = "high";
    urgencyConfidence = 0.9;
    reasons.push(`Detected high urgency keywords (${highUrgencyMatches} matches)`);
    signals.push("high_urgency_keywords");
  } else if (mediumUrgencyMatches > 0 || hasQuestions) {
    urgency = "medium";
    urgencyConfidence = 0.75;
    reasons.push("Detected medium urgency indicators");
    signals.push("medium_urgency_keywords");
  }

  // =====================
  // INTENT DETECTION
  // =====================

  let intent: Intent = "General Inquiry";
  let intentConfidence = 0.6;

  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("quote") ||
    lowerMessage.includes("pricing")
  ) {
    intent = "Pricing Information Request";
    intentConfidence = 0.95;
    reasons.push("Clear pricing intent detected");
    signals.push("pricing_keywords");
  } else if (
    lowerMessage.includes("sample") ||
    lowerMessage.includes("test") ||
    lowerMessage.includes("trial")
  ) {
    intent = "Sample Request";
    intentConfidence = 0.9;
    reasons.push("Sample request detected");
    signals.push("sample_keywords");
  } else if (
    lowerMessage.includes("order") ||
    lowerMessage.includes("purchase") ||
    lowerMessage.includes("buy") ||
    lowerMessage.includes("quantity")
  ) {
    intent = "Purchase Intent";
    intentConfidence = 0.85;
    reasons.push("Purchase intent detected");
    signals.push("purchase_keywords");
  } else if (
    lowerMessage.includes("specification") ||
    lowerMessage.includes("technical") ||
    lowerMessage.includes("datasheet") ||
    lowerMessage.includes("specs")
  ) {
    intent = "Technical Specification Inquiry";
    intentConfidence = 0.85;
    reasons.push("Technical inquiry detected");
    signals.push("technical_keywords");
  } else if (
    lowerMessage.includes("delivery") ||
    lowerMessage.includes("shipping") ||
    lowerMessage.includes("lead time") ||
    lowerMessage.includes("when")
  ) {
    intent = "Delivery Timeline Inquiry";
    intentConfidence = 0.8;
    reasons.push("Delivery timeline inquiry detected");
    signals.push("delivery_keywords");
  }

  // =====================
  // FRICTION DETECTION
  // =====================

  let primaryFriction: Friction = "information_gap";
  let frictionConfidence = 0.6;

  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("expensive") ||
    lowerMessage.includes("budget")
  ) {
    primaryFriction = "budget_uncertainty";
    frictionConfidence = 0.9;
    reasons.push("Budget concerns detected");
    signals.push("budget_keywords");
  } else if (
    lowerMessage.includes("which") ||
    lowerMessage.includes("what type") ||
    lowerMessage.includes("options") ||
    lowerMessage.includes("choose")
  ) {
    primaryFriction = "choice_overload";
    frictionConfidence = 0.8;
    reasons.push("Choice overload indicators detected");
    signals.push("choice_keywords");
  } else if (
    lowerMessage.includes("trust") ||
    lowerMessage.includes("reliable") ||
    lowerMessage.includes("quality") ||
    lowerMessage.includes("certified")
  ) {
    primaryFriction = "trust_validation";
    frictionConfidence = 0.85;
    reasons.push("Trust validation needs detected");
    signals.push("trust_keywords");
  } else if (urgency === "high") {
    primaryFriction = "timeline_pressure";
    frictionConfidence = 0.8;
    reasons.push("Timeline pressure from urgency");
    signals.push("timeline_pressure");
  } else if (messageLength < 30 || !hasQuestions) {
    primaryFriction = "low_commitment";
    frictionConfidence = 0.7;
    reasons.push("Low commitment indicators detected");
    signals.push("low_commitment");
  }

  // =====================
  // LEAD HALF-LIFE
  // =====================

  let leadHalfLifeMinutes = 1440;

  if (urgency === "high") {
    leadHalfLifeMinutes = 30;
  } else if (urgency === "medium") {
    leadHalfLifeMinutes = 120;
  } else if (intent === "Purchase Intent") {
    leadHalfLifeMinutes = 240;
  } else if (intent === "Pricing Information Request") {
    leadHalfLifeMinutes = 480;
  }

  // =====================
  // CONFIDENCE SCORING
  // =====================

  const overallConfidence =
    urgencyConfidence * 0.3 +
    intentConfidence * 0.4 +
    frictionConfidence * 0.3;

  // Boost confidence if signals align strongly
  if (urgencyConfidence > 0.8 && intentConfidence > 0.8) {
    const boostedConfidence = Math.min(0.95, overallConfidence + 0.1);
    reasons.push("High confidence from aligned urgency and intent signals");

    if (boostedConfidence >= 0.85) {
      return {
        shouldSkipLLM: true,
        analysis: {
          intent,
          urgency,
          primary_friction: primaryFriction,
          lead_half_life_minutes: leadHalfLifeMinutes,
          confidence: boostedConfidence,
        },
        confidence: boostedConfidence,
        reasons,
        signals,
      };
    }
  }

  // =====================
  // FALLBACK TO LLM
  // =====================

  return {
    shouldSkipLLM: false,
    confidence: overallConfidence,
    reasons: ["Rule-based confidence below threshold, using LLM"],
    signals: signals.length > 0 ? signals : ["default_classification"],
  };
}
