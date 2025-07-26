
/**
 * @fileOverview A Genkit flow for analyzing an online marketplace listing.
 *
 * This flow assesses a listing's quality, price fairness, and seller
 * reliability based on provided text, images, and context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ebaySearchTool } from '../tools/ebay-search-tool';

const ScoreAndReasonSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(10)
    .describe('A score from 0 (worst) to 10 (best).'),
  reason: z
    .string()
    .describe('A concise explanation for the given score.'),
});

const PriceFairnessSchema = z.object({
  isFair: z
    .boolean()
    .describe(
      'Whether the listing price is considered fair compared to the market.'
    ),
  marketValue: z
    .string()
    .optional()
    .describe('The estimated fair market value or price range.'),
  reason: z
    .string()
    .describe(
      'A concise explanation for the price fairness determination.'
    ),
});

const ListingQualitySchema = ScoreAndReasonSchema.extend({
  strengths: z
    .array(z.string())
    .describe('Specific aspects of the listing that are well-done.'),
  weaknesses: z
    .array(z.string())
    .describe('Specific aspects of the listing that are weak or missing.'),
  suggestions: z
    .array(z.string())
    .describe(
      'Actionable suggestions for how the seller could improve the listing.'
    ),
});

export const AnalyzeListingInputSchema = z.object({
  description: z.string().min(20).describe('The full text description of the listing.'),
  listingUrl: z.string().url().optional().describe('The URL of the online listing, for context.'),
  image: z
    .string()
    .optional()
    .describe(
      "An image of the item as a data URI. Format: 'data:image/jpeg;base64,...'"
    ),
});
export type AnalyzeListingInput = z.infer<typeof AnalyzeListingInputSchema>;

export const AnalyzeListingOutputSchema = z.object({
  overallScore: ScoreAndReasonSchema.describe(
    'An overall assessment of the listing, taking all factors into account.'
  ),
  listingQuality: ListingQualitySchema,
  priceFairness: PriceFairnessSchema,
  sellerReliability: ScoreAndReasonSchema.describe(
    'An inferred assessment of the seller\'s reliability based on the listing\'s content and presentation.'
  ),
  extractedInfo: z.object({
    itemCondition: z.string().optional().describe('The condition of the item (e.g., "New", "Used", "For parts").'),
    brand: z.string().optional().describe('The brand or manufacturer of the item.'),
    model: z.string().optional().describe('The model name or number of the item.'),
  }).describe('Key information extracted from the listing text and image.'),
});
export type AnalyzeListingOutput = z.infer<typeof AnalyzeListingOutputSchema>;

export async function analyzeListing(input: AnalyzeListingInput): Promise<AnalyzeListingOutput> {
  return analyzeListingFlow(input);
}

const analyzeListingPrompt = ai.definePrompt({
  name: 'analyzeListingPrompt',
  input: { schema: AnalyzeListingInputSchema },
  output: { schema: AnalyzeListingOutputSchema },
  tools: [ebaySearchTool],
  prompt: `You are ItemCheck AI, an expert system for analyzing online marketplace listings. Your goal is to provide a comprehensive, objective analysis to help users make smarter purchasing decisions.

Analyze the following listing based on the provided details. Use the tools provided to search for comparable items to determine price fairness.

**Listing Information:**
- URL: {{{listingUrl}}}
- Description:
---
{{{description}}}
---
{{#if image}}
- Image: {{media url=image}}
{{/if}}

**Your Task:**
Perform a detailed analysis and provide the output *strictly* in the required JSON format.

1.  **Extract Key Information**: From the text and image, identify and extract the item's condition, brand, and model. If a detail is not present, omit the field.

2.  **Assess Listing Quality (Score: 0-10)**:
    - Evaluate the clarity, detail, and completeness of the description and photos.
    - High scores for: Clear photos from multiple angles, detailed descriptions, specifications, mentions of condition, and transparency about flaws.
    - Low scores for: Vague descriptions, blurry/few photos, lack of important details.
    - Provide specific strengths, weaknesses, and actionable suggestions for improvement.

3.  **Check Price Fairness**:
    - Based on the item's description, brand, model, and condition, determine if the price is fair by using the provided search tool to find comparable listings.
    - State the estimated market value or a reasonable price range based on the search results.
    - Provide a clear reason for your assessment (e.g., "Priced appropriately for a used item with minor wear," or "Overpriced compared to new models.").

4.  **Evaluate Seller Reliability (Score: 0-10)**:
    - This is an *inferred* score based *only* on the listing provided.
    - High scores for: Professional tone, clear communication, detailed information, transparency about policies (shipping, returns).
    - Low scores for: Unprofessional language, pressure tactics ("act fast!"), evasiveness, keyword stuffing.
    - Provide a concise reason for the score based on these textual cues.

5.  **Calculate Overall Score (Score: 0-10)**:
    - Provide a holistic score that balances all factors: listing quality, price fairness, and seller reliability.
    - The reason should be a one-sentence summary of the entire analysis (e.g., "A high-quality listing with a fair price from a seemingly reliable seller.").

Your entire output must be a single JSON object matching the defined schema. Do not include any other commentary.`,
});


const analyzeListingFlow = ai.defineFlow(
  {
    name: 'analyzeListingFlow',
    inputSchema: AnalyzeListingInputSchema,
    outputSchema: AnalyzeListingOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeListingPrompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
