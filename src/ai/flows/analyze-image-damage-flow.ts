
/**
 * @fileOverview A Genkit flow for analyzing an image of an item for damage.
 *
 * This flow inspects an image to identify and describe any visible flaws,
 * wear, or damage, providing a report for a potential buyer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DamageIssueSchema = z.object({
  area: z
    .string()
    .describe('The specific part of the item where the issue is located (e.g., "Screen", "Left corner", "Leather strap").'),
  description: z
    .string()
    .describe('A detailed description of the issue, including its severity (e.g., "Deep scratch", "Minor scuffing", "Slight discoloration").'),
});

export const AnalyzeImageForDamageInputSchema = z.object({
  image: z
    .string()
    .describe(
      "A photo of the item as a data URI. Format: 'data:image/jpeg;base64,...'"
    ),
});
export type AnalyzeImageForDamageInput = z.infer<typeof AnalyzeImageForDamageInputSchema>;

export const AnalyzeImageForDamageOutputSchema = z.object({
  summary: z.string().describe('A one-sentence summary of the overall condition of the item based on the image.'),
  issuesFound: z.array(DamageIssueSchema).describe('A list of all the specific damages or issues identified in the image.'),
});
export type AnalyzeImageForDamageOutput = z.infer<typeof AnalyzeImageForDamageOutputSchema>;

export async function analyzeImageForDamage(input: AnalyzeImageForDamageInput): Promise<AnalyzeImageForDamageOutput> {
  return analyzeImageDamageFlow(input);
}

const analyzeImageDamagePrompt = ai.definePrompt({
  name: 'analyzeImageDamagePrompt',
  input: { schema: AnalyzeImageForDamageInputSchema },
  output: { schema: AnalyzeImageForDamageOutputSchema },
  prompt: `You are a meticulous product inspector AI. Your task is to analyze the provided image of an item and identify any and all signs of damage, wear, or imperfections. Your audience is a potential buyer who needs to be aware of every possible issue before making a purchase.

**Image to Analyze:**
{{media url=image}}

**Your Task:**
1.  **Thoroughly inspect the image.** Look for scratches, scuffs, dents, cracks, discoloration, stains, tears, missing parts, or any other deviation from a perfect condition.
2.  **Create a list of issues.** For each issue you find, describe its location (area) and what the issue is (description). Be specific. For example, instead of "damage", say "a 2cm scratch on the top surface".
3.  **Provide a summary.** Give a one-sentence overall summary of the item's condition based on your findings.
4.  **Format the output strictly as JSON.** If there are no issues, return an empty array for "issuesFound".`,
});


const analyzeImageDamageFlow = ai.defineFlow(
  {
    name: 'analyzeImageDamageFlow',
    inputSchema: AnalyzeImageForDamageInputSchema,
    outputSchema: AnalyzeImageForDamageOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeImageDamagePrompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
