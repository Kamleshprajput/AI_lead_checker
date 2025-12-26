import { Request, Response } from "express";
import { leadInputSchema } from "../validation/leadInput.schema";
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
    // 1️⃣ Validate input
    const validationResult = leadInputSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    const { message } = validationResult.data;

    // 2️⃣ Analyze lead
    const result = await analyzeLeadInquiry(message);

    // 3️⃣ Return response (backward compatible)
    res.status(200).json({
      analysis: result.analysis,
      friction_action: result.friction_action,
      decay_priority: result.decay_priority,
      human_required: result.human_required,

      // Explainability metadata (optional)
      decision_reasons: result.decision_reasons,
      detected_signals: result.detected_signals,

      // Debug / observability (safe to remove in prod)
      _meta: {
        llm_called: result.llm_called,
      },
    });
  } catch (error: unknown) {
    console.error("createLead error:", error);

    // 4️⃣ Typed error handling
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        res.status(500).json({
          error: "Configuration error",
          message: "AI service is not properly configured",
        });
        return;
      }

      if (error.message.toLowerCase().includes("rate limit")) {
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
