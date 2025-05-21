// 'use server';

/**
 * @fileOverview AI flow for analyzing marketplace listings to assess quality, price fairness, and seller reliability.
 *
 * - analyzeListing - Analyzes the listing.
 * - AnalyzeListingInput - The input type for the analyzeListing function.
 * - AnalyzeListingOutput - The return type for the analyzeListing function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeListingInputSchema = z.object({
  image: z
    .string()
    .describe(
      'The image of the listing as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  description: z.string().describe('The description of the listing.'),
});

export type AnalyzeListingInput = z.infer<typeof AnalyzeListingInputSchema>;

const AnalyzeListingOutputSchema = z.object({
  listingQuality: z.object({
    qualityScore: z
      .number()
      .describe('A score representing the listing quality (0-100).'),
    qualityAssessment: z.string().describe('Assessment of the listing quality'),
    suggestions: z.string().describe('Suggestions for improving the listing.'),
  }),
  priceFairness: z.object({
    isFairPrice: z.boolean().describe('Whether the price is fair or not.'),
    fairMarketValue: z.string().describe('The fair market value of the item.'),
    priceReasoning: z.string().describe('Reasoning for the price fairness check.'),
  }),
  sellerReliability: z.object({
    isReliableSeller: z.boolean().describe('Whether the seller is reliable or not.'),
    reliabilityScore: z
      .number()
      .describe('A score representing the seller reliability (0-100).'),
    reliabilityReasoning: z.string().describe('Reasoning for the seller reliability check.'),
  }),
  extractedInformation: z.string().describe('Extracted information from the listing image and description.'),
});

export type AnalyzeListingOutput = z.infer<typeof AnalyzeListingOutputSchema>;

export async function analyzeListing(input: AnalyzeListingInput): Promise<AnalyzeListingOutput> {
  return analyzeListingFlow(input);
}

const analyzeListingPrompt = ai.definePrompt({
  name: 'analyzeListingPrompt',
  input: {schema: AnalyzeListingInputSchema},
  output: {schema: AnalyzeListingOutputSchema},
  prompt: `You are an AI assistant that analyzes marketplace listings to assess their quality, price fairness, and seller reliability.

  Analyze the following listing:
  Description: {{{description}}}
  Image: {{media url=image}}

  Provide a detailed analysis of the listing, including:
  - A listing quality score (0-100) and assessment, with suggestions for improvement.
  - A price fairness check, indicating whether the price is fair and providing a fair market value estimate.
  - An evaluation of the seller's reliability, including a reliability score (0-100) and reasoning.
  - Extracted information from the listing image and description.

  Ensure that the output is well-structured and easy to understand.
  Follow the schema description for output formatting.`,
});

const analyzeListingFlow = ai.defineFlow(
  {
    name: 'analyzeListingFlow',
    inputSchema: AnalyzeListingInputSchema,
    outputSchema: AnalyzeListingOutputSchema,
  },
  async input => {
    const {output} = await analyzeListingPrompt(input);
    return output!;
  }
);
