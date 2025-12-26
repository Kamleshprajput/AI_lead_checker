import { z } from "zod";

export const LeadInputSchema = z.object({
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must not exceed 5000 characters")
    .refine(
      (msg) => {
        const suspiciousPatterns = [
          /ignore\s+(previous|all)\s+(instructions|prompts)/i,
          /system\s*:\s*you\s+are/i,
          /\[INST\]|\[/INST\]/i,
          /<\|.*?\|>/i,
        ];
        return !suspiciousPatterns.some((pattern) => pattern.test(msg));
      },
      { message: "Invalid message format detected" }
    ),
  source: z.string().max(100).optional().default("web_form"),
  contact: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;

