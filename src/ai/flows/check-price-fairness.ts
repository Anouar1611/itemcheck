'use server';
/**
 * @fileOverview An AI agent for evaluating the price fairness of a listing.
 *
 * - checkPriceFairness - A function that handles the price fairness check process.
 * - CheckPriceFairnessInput - The input type for the checkPriceFairness function.
 * - CheckPriceFairnessOutput - The return type for the checkPriceFairness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckPriceFairnessInputSchema = z.object({
  listingDescription: z.string().describe('The description of the listing.'),
  listingPrice: z.number().describe('The price of the listing.'),
  similarItemsData: z
    .string()
    .describe(
      'Data on similar items, including their descriptions and prices, for comparison.'
    ),
});
export type CheckPriceFairnessInput = z.infer<typeof CheckPriceFairnessInputSchema>;

const CheckPriceFairnessOutputSchema = z.object({
  isFairPrice: z
    .boolean()
    .describe('Whether the listing price is fair compared to similar items.'),
  fairnessExplanation: z
    .string()
    .describe('An explanation of why the price is considered fair or unfair.'),
  suggestedPriceRange: z
    .string()
    .describe('A suggested price range for the listing based on comparable items.'),
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
  prompt: `You are an expert in evaluating the fairness of prices for items listed online.

You will be given a description of the listing, the listing price, and data on similar items.

Based on this information, you will determine if the listing price is fair. You will also provide an explanation of why the price is considered fair or unfair, and suggest a price range for the listing.

Listing Description: {{{listingDescription}}}
Listing Price: {{{listingPrice}}}
Similar Items Data: {{{similarItemsData}}}

Consider the condition of the item, the completeness of the description, and any other relevant factors when evaluating the price.

Output in JSON format.
`,
});

const checkPriceFairnessFlow = ai.defineFlow(
  {
    name: 'checkPriceFairnessFlow',
    inputSchema: CheckPriceFairnessInputSchema,
    outputSchema: CheckPriceFairnessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
