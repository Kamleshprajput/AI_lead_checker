import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import {
  LeadAnalysisSchema,
  LeadAnalysis
} from "../schemas/leadAnalysis.schema";
import { leadAnalysisPrompt } from "../prompts/leadAnalysis.prompt";

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

const parser = StructuredOutputParser.fromZodSchema(
  LeadAnalysisSchema
);

const prompt = new PromptTemplate({
  template: leadAnalysisPrompt + "\n{format_instructions}",
  inputVariables: ["lead"],
  partialVariables: {
    format_instructions: parser.getFormatInstructions(),
  },
});

export async function analyzeLead(
  lead: string
): Promise<LeadAnalysis> {
  const chain = prompt.pipe(model).pipe(parser);

  const result = await chain.invoke({ lead });

  // 🔒 Runtime + compile-time safety
  return LeadAnalysisSchema.parse(result);
}
