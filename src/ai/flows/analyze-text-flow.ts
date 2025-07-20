/**
 * @fileOverview An AI flow for analyzing text to detect biases and contradictions.
 *
 * - analyzeTextForBias - Analyzes the provided text.
 * - AnalyzeTextForBiasInput - The input type for the analyzeTextForBias function.
 * - AnalyzeTextForBiasOutput - The return type for the analyzeTextForBias function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BiasAnalysisSchema = z.object({
  isPresent: z.boolean().describe('Whether a specific type of bias is present in the text.'),
  evidence: z.string().optional().describe('The specific text snippet that demonstrates the bias. Only include if bias is present.'),
  explanation: z.string().optional().describe('A brief explanation of why the text is considered biased. Only include if bias is present.'),
});

const ContradictionAnalysisSchema = z.object({
  isContradictory: z.boolean().describe('Whether the text contains internal contradictions.'),
  contradiction: z.string().optional().describe('The specific contradictory statement or idea. Only include if contradictions are present.'),
  explanation: z.string().optional().describe('A brief explanation of the contradiction. Only include if contradictions are present.'),
});

export const AnalyzeTextForBiasInputSchema = z.object({
  text: z.string().min(20).describe('The text content to be analyzed.'),
});
export type AnalyzeTextForBiasInput = z.infer<typeof AnalyzeTextForBiasInputSchema>;

export const AnalyzeTextForBiasOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the analysis findings.'),
  biases: z.object({
    political: BiasAnalysisSchema,
    gender: BiasAnalysisSchema,
    confirmation: BiasAnalysisSchema.describe('Confirmation bias, where the text seems to favor information that confirms pre-existing beliefs.'),
  }),
  contradictions: ContradictionAnalysisSchema,
});
export type AnalyzeTextForBiasOutput = z.infer<typeof AnalyzeTextForBiasOutputSchema>;

export async function analyzeTextForBias(input: AnalyzeTextForBiasInput): Promise<AnalyzeTextForBiasOutput> {
  return analyzeTextForBiasFlow(input);
}

const analyzeTextPrompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: { schema: AnalyzeTextForBiasInputSchema },
  output: { schema: AnalyzeTextForBiasOutputSchema },
  prompt: `You are an expert content analyst specializing in detecting logical fallacies, biases, and internal contradictions in text. Your analysis must be objective, neutral, and based solely on the provided text.

Analyze the following text:
---
{{{text}}}
---

Perform the following analysis and provide the output in the required JSON format:

1.  **Biases**: Examine the text for the following specific types of bias (political, gender, confirmation). For each type:
    *   Set \`isPresent\` to true if you find clear evidence, otherwise false.
    *   If true, provide the specific \`evidence\` (a direct quote) and a concise \`explanation\`. If false, omit these fields.

2.  **Contradictions**: Examine the text for any internal contradictions, where statements made within the text conflict with each other.
    *   Set \`isContradictory\` to true if you find a clear contradiction, otherwise false.
    *   If true, describe the \`contradiction\` and provide an \`explanation\`. If false, omit these fields.

3.  **Summary**: Write a brief, high-level summary of your findings.

Your entire output must strictly adhere to the provided JSON schema. Do not add any commentary outside of the JSON structure.`,
});

const analyzeTextForBiasFlow = ai.defineFlow(
  {
    name: 'analyzeTextForBiasFlow',
    inputSchema: AnalyzeTextForBiasInputSchema,
    outputSchema: AnalyzeTextForBiasOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeTextPrompt(input);
    return output!;
  }
);
