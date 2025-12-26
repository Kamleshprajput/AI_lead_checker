import { Request, Response } from "express";
import { LeadInputSchema } from "../validation/leadInput.schema";
import { analyzeLeadInquiry } from "../services/leadAnalysis.service";

export async function createLead(
  req: Request,
  res: Response
): Promise<void> {
  try {
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
    const result = await analyzeLeadInquiry(message);
    
    res.status(200).json({
      analysis: result.analysis,
      friction_action: result.friction_action,
      decay_priority: result.decay_priority,
      human_required: result.human_required,
      decision_reasons: result.decision_reasons,
      detected_signals: result.detected_signals,
      _meta: {
        llm_called: result.llm_called,
      },
    });
  } catch (error) {
    console.error("createLead error:", error);
    
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
