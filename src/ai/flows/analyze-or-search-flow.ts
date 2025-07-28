/**
 * @fileOverview A meta Genkit flow that determines user intent and routes
 * to either a listing analysis or a product search.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  analyzeListing,
  AnalyzeListingInputSchema,
  AnalyzeListingOutputSchema,
} from './analyze-listing-flow';
import {
  productSearchAndAnalysis,
  ProductSearchInputSchema,
  ProductSearchOutputSchema,
} from './product-search-and-analysis-flow';

export const AnalyzeOrSearchInputSchema = z.object({
  query: z
    .string()
    .describe('The user input. Can be a product name or a listing description.'),
  listingUrl: z
    .string()
    .url()
    .optional()
    .describe('The URL of the online listing, if provided.'),
  image: z
    .string()
    .optional()
    .describe(
      "An image of the item as a data URI. Format: 'data:image/jpeg;base64,...'"
    ),
});
export type AnalyzeOrSearchInput = z.infer<typeof AnalyzeOrSearchInputSchema>;

export const AnalyzeOrSearchOutputSchema = z.object({
  analysisType: z.enum(['listing', 'search']),
  listingAnalysis: AnalyzeListingOutputSchema.optional(),
  productSearch: ProductSearchOutputSchema.optional(),
});
export type AnalyzeOrSearchOutput = z.infer<
  typeof AnalyzeOrSearchOutputSchema
>;

export async function analyzeOrSearch(
  input: AnalyzeOrSearchInput
): Promise<AnalyzeOrSearchOutput> {
  return analyzeOrSearchFlow(input);
}

const intentPrompt = ai.definePrompt({
  name: 'determineUserIntentPrompt',
  input: { schema: z.object({ query: z.string() }) },
  output: { schema: z.object({ intent: z.enum(['analysis', 'search']) }) },
  prompt: `You are an AI assistant that determines a user's intent based on their input.
The user wants to either get a detailed analysis of a specific used item listing OR search for the best price for a general new product.

- If the input text is long, detailed, and describes a specific item's condition, it's an 'analysis'.
- If the input text is short and looks like a product name or category, it's a 'search'.

User Input:
---
{{{query}}}
---

Based on the user input, is the primary intent 'analysis' or 'search'?`,
});

const analyzeOrSearchFlow = ai.defineFlow(
  {
    name: 'analyzeOrSearchFlow',
    inputSchema: AnalyzeOrSearchInputSchema,
    outputSchema: AnalyzeOrSearchOutputSchema,
  },
  async (input) => {
    // If a URL is provided or the description is very long, it's definitely a listing analysis.
    // Length check helps differentiate between "Vintage leather jacket, size medium, some scuffs" (analysis)
    // and "leather jacket" (search).
    if (input.listingUrl || input.query.length > 50) {
      console.log('Performing listing analysis due to URL or query length.');
      const listingResult = await analyzeListing({
        description: input.query,
        listingUrl: input.listingUrl,
        image: input.image,
      });
      return {
        analysisType: 'listing',
        listingAnalysis: listingResult,
      };
    }

    // If the input is shorter, use an AI prompt to determine the intent.
    const { output } = await intentPrompt({ query: input.query });
    const intent = output?.intent;

    if (intent === 'analysis') {
      console.log('Intent determined as "analysis".');
      const listingResult = await analyzeListing({
        description: input.query,
        image: input.image,
      });
      return {
        analysisType: 'listing',
        listingAnalysis: listingResult,
      };
    } else {
      console.log('Intent determined as "search".');
      const searchResult = await productSearchAndAnalysis({
        query: input.query,
      });
      return {
        analysisType: 'search',
        productSearch: searchResult,
      };
    }
  }
);
