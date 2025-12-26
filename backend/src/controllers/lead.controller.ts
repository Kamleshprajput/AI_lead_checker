import { Request, Response } from "express";
import { LeadInputSchema } from "../validation/leadInput.schema";
import { analyzeLeadInquiry } from "../services/leadAnalysis.service";

/**
 * Create Lead Controller
 * 
 * Handles lead analysis requests with:
 * - Input validation
 * - Rate limiting (via middleware)
 * - Analysis orchestration
 * - Error handling
 */
export async function createLead(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validate input
    const validationResult = LeadInputSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      
      res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
      return;
    }
    
    const { message } = validationResult.data;
    
    // Analyze lead
    const result = await analyzeLeadInquiry(message);
    
    // Return response (backward compatible format)
    // Note: decision_reasons and detected_signals are included for explainability
    // but frontend can ignore them if not needed
    res.status(200).json({
      analysis: result.analysis,
      friction_action: result.friction_action,
      decay_priority: result.decay_priority,
      human_required: result.human_required,
      // Explainability metadata (optional, frontend can ignore)
      decision_reasons: result.decision_reasons,
      detected_signals: result.detected_signals,
      // Debug info (can be removed in production)
      _meta: {
        llm_called: result.llm_called,
      },
    });
  } catch (error) {
    console.error("createLead error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        res.status(500).json({
          error: "Configuration error",
          message: "AI service is not properly configured",
        });
        return;
      }
      
      if (error.message.includes("Rate limit")) {
        res.status(429).json({
          error: "Rate limit exceeded",
          message: error.message,
        });
        return;
      }
    }
    
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while processing your request",
    });
  }
}
