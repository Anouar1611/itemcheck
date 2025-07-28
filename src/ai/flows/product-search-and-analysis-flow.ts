import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ebaySearchTool } from '../tools/ebay-search-tool';
import { amazonSearchTool } from '../tools/amazon-search-tool';
import { aliexpressSearchTool } from '../tools/aliexpress-search-tool';

export const ProductSearchInputSchema = z.object({
  query: z.string().describe('The product the user is searching for.'),
});
export type ProductSearchInput = z.infer<typeof ProductSearchInputSchema>;

const ListingComparisonSchema = z.object({
  platform: z.string().describe('The e-commerce platform (e.g., eBay, Amazon).'),
  bestPrice: z.string().describe('The best price found on the platform.'),
  deliveryConditions: z
    .string()
    .describe('Summary of the delivery conditions (e.g., "1-2 day shipping").'),
  bestListingUrl: z.string().url().describe('URL to the best listing found.'),
});

export const ProductSearchOutputSchema = z.object({
  overallVerdict: z.object({
    isRecommended: z.boolean().describe('Whether the AI recommends purchasing this product based on its analysis.'),
    reason: z.string().describe('A summary of why the product is or is not recommended.'),
    bestPlatform: z.string().optional().describe('The platform with the overall best offer.')
  }),
  comparisons: z.array(ListingComparisonSchema).describe('A comparison of findings across different e-commerce platforms.'),
  similarItems: z.array(z.object({
      name: z.string().describe('Name of the similar item.'),
      reason: z.string().describe('Why this item is a good alternative.'),
  })).describe('Suggestions for similar or alternative products.'),
  alternativeReplacements: z.array(z.object({
      name: z.string().describe('Name of a product that could replace the searched item.'),
      reason: z.string().describe('Why this is a viable replacement.'),
  })).describe('Suggestions for items that could replace the need for the searched product.'),
  suggestedPaymentMethods: z.array(z.string()).describe('A list of suggested easy and secure payment methods (e.g., "Credit Card", "PayPal").'),
});
export type ProductSearchOutput = z.infer<typeof ProductSearchOutputSchema>;

export async function productSearchAndAnalysis(
  input: ProductSearchInput
): Promise<ProductSearchOutput> {
  return productSearchFlow(input);
}

const productSearchPrompt = ai.definePrompt({
  name: 'productSearchPrompt',
  input: { schema: ProductSearchInputSchema },
  output: { schema: ProductSearchOutputSchema },
  tools: [ebaySearchTool, amazonSearchTool, aliexpressSearchTool],
  prompt: `You are a world-class AI shopping assistant. Your goal is to help users find the best deal and make informed decisions when shopping online.

A user is searching for the following product: "{{query}}".

Your task is to perform a comprehensive analysis by following these steps:
1.  **Search across platforms:** Use all the provided tools (eBay, Amazon, AliExpress) to find listings for "{{query}}".
2.  **Compare Findings:** For each platform, identify the listing with the best price and note its delivery conditions.
3.  **Formulate an Overall Verdict:** Based on all the gathered information, decide if this product is generally a good purchase ("worth it"). Provide a clear recommendation (isRecommended) and a summary reason. Identify which platform offers the best overall deal.
4.  **Suggest Alternatives:**
    - Brainstorm and suggest similar items that the user might also be interested in.
    - Think outside the box and suggest items that could *replace* the need for the searched product entirely.
5.  **Suggest Payment Methods:** Recommend a few common, easy, and secure payment methods for online shopping.

Provide your final output *strictly* in the required JSON format. Do not include any other commentary.`,
});

const productSearchFlow = ai.defineFlow(
  {
    name: 'productSearchFlow',
    inputSchema: ProductSearchInputSchema,
    outputSchema: ProductSearchOutputSchema,
  },
  async (input) => {
    const { output } = await productSearchPrompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
