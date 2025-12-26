import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import {
  LeadAnalysisSchema,
  LeadAnalysis
} from "../schemas/leadAnalysis.schema";
import { leadAnalysisPrompt, leadAnalysisRetryPrompt } from "../prompts/leadAnalysis.prompt";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

const retryModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
  maxTokens: 200,
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

const retryPrompt = new PromptTemplate({
  template: leadAnalysisRetryPrompt + "\n{format_instructions}",
  inputVariables: ["lead"],
  partialVariables: {
    format_instructions: parser.getFormatInstructions(),
  },
});

export async function analyzeLead(
  lead: string,
  retryOnLowConfidence: boolean = true
): Promise<LeadAnalysis> {
  const chain = prompt.pipe(model).pipe(parser);
  
  try {
    const result = await chain.invoke({ lead });
    const validated = LeadAnalysisSchema.parse(result);
    
    if (validated.confidence >= 0.85) {
      return validated;
    }
    
    if (validated.confidence < 0.60) {
      return validated;
    }
    
    if (retryOnLowConfidence && validated.confidence >= 0.60 && validated.confidence < 0.85) {
      try {
        const retryChain = retryPrompt.pipe(retryModel).pipe(parser);
        const retryResult = await retryChain.invoke({ lead });
        const retryValidated = LeadAnalysisSchema.parse(retryResult);
        
        if (retryValidated.confidence > validated.confidence) {
          return retryValidated;
        }
      } catch (retryError) {
        console.warn("Retry failed, using original result:", retryError);
      }
    }
    
    return validated;
  } catch (error) {
    console.error("LLM analysis error:", error);
    throw error;
  }
}
