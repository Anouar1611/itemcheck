/**
 * @fileOverview A meta Genkit flow that determines user intent, routes
 * to the appropriate analysis, and saves the result to Firestore.
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
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  // Add query back into the output so it can be saved to history
  query: z.string().optional(),
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

// Helper function to save results to Firestore
async function saveToHistory(result: AnalyzeOrSearchOutput) {
  const user = auth.currentUser;
  if (!user) {
    console.log("User not logged in. Skipping save to history.");
    return;
  }
  try {
    const historyCollection = collection(db, `userHistory/${user.uid}/analyses`);
    await addDoc(historyCollection, {
      ...result,
      createdAt: serverTimestamp(), // Use server timestamp for consistency
    });
    console.log('Successfully saved analysis to user history.');
  } catch (error) {
    console.error("Error saving to Firestore: ", error);
  }
}


const analyzeOrSearchFlow = ai.defineFlow(
  {
    name: 'analyzeOrSearchFlow',
    inputSchema: AnalyzeOrSearchInputSchema,
    outputSchema: AnalyzeOrSearchOutputSchema,
  },
  async (input) => {
    let result: AnalyzeOrSearchOutput;

    if (input.listingUrl || input.query.length > 50) {
      console.log('Performing listing analysis due to URL or query length.');
      const listingResult = await analyzeListing({
        description: input.query,
        listingUrl: input.listingUrl,
        image: input.image,
      });
      result = {
        analysisType: 'listing',
        listingAnalysis: listingResult,
        query: input.query,
      };
    } else {
      const { output } = await intentPrompt({ query: input.query });
      const intent = output?.intent;

      if (intent === 'analysis') {
        console.log('Intent determined as "analysis".');
        const listingResult = await analyzeListing({
          description: input.query,
          image: input.image,
        });
        result = {
          analysisType: 'listing',
          listingAnalysis: listingResult,
          query: input.query,
        };
      } else {
        console.log('Intent determined as "search".');
        const searchResult = await productSearchAndAnalysis({
          query: input.query,
        });
        result = {
          analysisType: 'search',
          productSearch: searchResult,
          query: input.query,
        };
      }
    }
    
    // Asynchronously save the result to Firestore without blocking the response
    await saveToHistory(result);
    
    return result;
  }
);
