
'use server';
/**
 * @fileOverview An AI agent for evaluating the price fairness of a listing,
 * potentially using a tool to fetch comparable items from eBay.
 *
 * - checkPriceFairness - A function that handles the price fairness check process.
 * - CheckPriceFairnessInput - The input type for the checkPriceFairness function.
 * - CheckPriceFairnessOutput - The return type for the checkPriceFairness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ebaySearchTool } from '@/ai/tools/ebay-search-tool';

const CheckPriceFairnessInputSchema = z.object({
  listingDescription: z.string().describe('The description of the listing. This will be used by the ebaySearchTool to find comparables.'),
  listingPrice: z.number().describe('The price of the listing.'),
  // similarItemsData removed as the tool will fetch this now.
});
export type CheckPriceFairnessInput = z.infer<typeof CheckPriceFairnessInputSchema>;

const CheckPriceFairnessOutputSchema = z.object({
  isFairPrice: z
    .boolean()
    .describe('Whether the listing price is fair compared to similar items found by the tool.'),
  fairnessExplanation: z
    .string()
    .describe('An explanation of why the price is considered fair or unfair, considering data from the tool.'),
  suggestedPriceRange: z
    .string()
    .describe('A suggested price range for the listing based on comparable items found by the tool.'),
});
export type CheckPriceFairnessOutput = z.infer<typeof CheckPriceFairnessOutputSchema>;

export async function checkPriceFairness(
  input: CheckPriceFairnessInput
): Promise<CheckPriceFairnessOutput> {
  return checkPriceFairnessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkPriceFairnessPrompt',
  input: {schema: CheckPriceFairnessInputSchema},
  output: {schema: CheckPriceFairnessOutputSchema},
  tools: [ebaySearchTool],
  prompt: `You are an expert in evaluating the fairness of prices for items listed online.

You will be given a description of the listing and its price.
Use the 'ebaySearchTool' to find comparable items on eBay based on the 'listingDescription'.
Then, using the data provided by the tool and the 'listingPrice', determine if the listing price is fair. You will also provide an explanation of why the price is considered fair or unfair, and suggest a price range for the listing.

Listing Description: {{{listingDescription}}}
Listing Price: {{{listingPrice}}}

Consider the condition of the item from the description, the completeness of the description, and any other relevant factors when evaluating the price based on the tool's output.

Output in JSON format according to the defined schema.
`,
});

const checkPriceFairnessFlow = ai.defineFlow(
  {
    name: 'checkPriceFairnessFlow',
    inputSchema: CheckPriceFairnessInputSchema,
    outputSchema: CheckPriceFairnessOutputSchema,
    tools: [ebaySearchTool], // Make tool available to the flow
  },
  async input => {
    const {output} = await prompt(input); // The prompt will decide if/when to call the tool
    return output!;
  }
);
