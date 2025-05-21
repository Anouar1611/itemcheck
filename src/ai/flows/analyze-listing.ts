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
  listingUrl: z.string().url().optional()
    .describe("The URL of the marketplace listing page, if available. The AI cannot access this URL directly but uses it for context."),
  image: z
    .string()
    .optional()
    .describe(
      "The image of the listing as a data URI (e.g., 'data:image/jpeg;base64,ASI...') from an upload. This is used for direct image analysis by the AI."
    ),
  description: z.string().describe('The description of the listing.'),
}).refine(data => data.image || data.listingUrl, {
  message: "Either an image upload or a listing URL must be provided along with the description.",
  path: ["description"], // This refine is more for server-side, client handles primary validation
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
  extractedInformation: z.string().describe('Extracted information from the listing image (if provided) and description.'),
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

  {{#if listingUrl}}
  The listing is reportedly from the following URL (NOTE: You CANNOT access this URL directly. Use it for context only if no direct image is provided): {{{listingUrl}}}
  {{/if}}

  Analyze the following listing details:
  Description: {{{description}}}
  {{#if image}}
  Image: {{media url=image}}
  {{else}}
  No direct image was uploaded for this analysis. Base visual assessment on the description and any context from the listing URL (if provided).
  {{/if}}

  Provide a detailed analysis of the listing, including:
  - A listing quality score (0-100) and assessment, with suggestions for improvement.
  - A price fairness check, indicating whether the price is fair and providing a fair market value estimate.
  - An evaluation of the seller's reliability, including a reliability score (0-100) and reasoning.
  - Extracted information from the listing image (if an image was provided) and description.

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
