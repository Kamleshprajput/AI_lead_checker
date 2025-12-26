import { Request, Response } from "express";

import { analyzeLead } from "../ai/chains/leadAnalysis.chain";
import { frictionStrategy } from "../workflow/leadFriction.engine";
import { decayPriority } from "../workflow/leadDecay.engine";
import { requiresHumanReview } from "../workflow/humanGate";
import { LeadAnalysis } from "../ai/schemas/leadAnalysis.schema";

export async function createLead(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { message, source, contact } = req.body as {
      message: string;
      source?: string;
      contact?: string;
    };

    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const analysis: LeadAnalysis = await analyzeLead(message);

    res.status(200).json({
      analysis,
      friction_action: frictionStrategy(analysis.primary_friction),
      decay_priority: decayPriority(analysis.lead_half_life_minutes),
      human_required: requiresHumanReview(analysis),
    });
  } catch (error) {
    console.error("createLead error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
