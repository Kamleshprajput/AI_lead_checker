import { deterministicClassifier, PreFilterResult } from "../prefilter/deterministic.classifier";
import { analyzeLead } from "../ai/chains/leadAnalysis.chain";
import { frictionStrategy } from "../workflow/leadFriction.engine";
import { decayPriority } from "../workflow/leadDecay.engine";
import { requiresHumanReview } from "../workflow/humanGate";
import { LeadAnalysis, LeadAnalysisResponse } from "../ai/schemas/leadAnalysis.schema";
import { sanitizeInput } from "../middleware/safetyGuards";

export interface AnalysisResult {
  analysis: LeadAnalysis;
  friction_action: string;
  decay_priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  human_required: boolean;
  decision_reasons: string[];
  detected_signals: string[];
  llm_called: boolean;
}

export async function analyzeLeadInquiry(
  message: string
): Promise<AnalysisResult> {
  const sanitizedMessage = sanitizeInput(message);
  const preFilterResult: PreFilterResult = deterministicClassifier(sanitizedMessage);
  
  let analysis: LeadAnalysis;
  let llmCalled = false;
  const decisionReasons: string[] = [...preFilterResult.reasons];
  const detectedSignals: string[] = [...preFilterResult.signals];
  
  if (preFilterResult.shouldSkipLLM && preFilterResult.analysis) {
    analysis = preFilterResult.analysis;
    decisionReasons.push("Used deterministic pre-filter (skipped LLM call)");
    detectedSignals.push("prefilter_used");
  } else {
    llmCalled = true;
    decisionReasons.push("LLM inference required (pre-filter confidence below threshold)");
    detectedSignals.push("llm_inference");
    
    try {
      analysis = await analyzeLead(sanitizedMessage, true);
      
      if (analysis.confidence >= 0.85) {
        detectedSignals.push("high_confidence_llm");
        decisionReasons.push(`High confidence LLM result (${(analysis.confidence * 100).toFixed(0)}%)`);
      } else if (analysis.confidence < 0.60) {
        detectedSignals.push("low_confidence_llm");
        decisionReasons.push(`Low confidence LLM result (${(analysis.confidence * 100).toFixed(0)}%) - human review required`);
      } else {
        detectedSignals.push("medium_confidence_llm");
        decisionReasons.push(`Medium confidence LLM result (${(analysis.confidence * 100).toFixed(0)}%)`);
      }
    } catch (error) {
      console.error("LLM analysis failed:", error);
      if (preFilterResult.analysis) {
        analysis = preFilterResult.analysis;
        decisionReasons.push("LLM failed, using deterministic fallback");
        detectedSignals.push("llm_fallback");
      } else {
        throw new Error("Analysis failed: LLM error and no fallback available");
      }
    }
  }
  
  const frictionAction = frictionStrategy(analysis.primary_friction);
  const decayPriorityValue = decayPriority(analysis.lead_half_life_minutes);
  const humanRequired = requiresHumanReview(analysis);
  
  if (humanRequired) {
    decisionReasons.push("Human review required based on analysis criteria");
    detectedSignals.push("human_review_triggered");
  }
  
  decisionReasons.push(`Friction action: ${frictionAction}`);
  decisionReasons.push(`Decay priority: ${decayPriorityValue}`);
  
  return {
    analysis,
    friction_action: frictionAction,
    decay_priority: decayPriorityValue,
    human_required: humanRequired,
    decision_reasons: decisionReasons,
    detected_signals: detectedSignals,
    llm_called: llmCalled,
  };
}

