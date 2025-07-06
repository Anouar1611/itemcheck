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
import { ebaySearchTool } from '@/ai/tools/ebay-search-tool';

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
  tools: [ebaySearchTool],
  prompt: `You are an expert marketplace analyst AI, designed to help users make informed purchasing decisions. Your goal is to provide a comprehensive, structured analysis of an online listing based on the provided information.

**IMPORTANT**: For the price fairness analysis, you MUST use the \`ebaySearchTool\` to find comparable items. Use the full \`description\` of the item as the search term for the tool.

Here is the listing information you need to analyze:
{{#if listingUrl}}
- **Listing URL**: {{{listingUrl}}} (Note: You cannot access this URL. Use it for context only.)
{{/if}}
- **Listing Description**: {{{description}}}
{{#if image}}
- **Listing Image**: {{media url=image}}
{{else}}
- **Listing Image**: None provided. Base your visual assessment on the description.
{{/if}}

Please perform the following analysis and provide the output in the required JSON format:

**1. Extracted Information (\`extractedInformation\`)**
- Summarize the key details you can identify from the image and description. This includes the item's name, brand, model, condition (e.g., new, used, damaged), and any included accessories. Be concise and factual.

**2. Listing Quality (\`listingQuality\`)**
- **Quality Score (\`qualityScore\`):** Provide a score from 0 to 100.
  - Base this on the clarity and quality of the image (if provided), and the detail, grammar, and completeness of the description. High-quality images and detailed, well-written descriptions get higher scores.
- **Quality Assessment (\`qualityAssessment\`):** Write a brief assessment explaining the score. Mention specific strengths (e.g., "clear, well-lit photos") and weaknesses (e.g., "vague description, missing key details").
- **Suggestions (\`suggestions\`):** Provide actionable suggestions for how the seller could improve the listing to attract more buyers and justify its price.

**3. Price Fairness (\`priceFairness\`)**
- **Analysis**: Use the \`ebaySearchTool\` with the item's description to get a summary of comparable listings and their prices.
- **Fair Market Value (\`fairMarketValue\`):** Based on the tool's output and the item's described condition, estimate a fair market value range (e.g., "$100 - $120").
- **Is Fair Price (\`isFairPrice\`):** Based on your estimated fair market value, determine if the item's price (which you will need to infer from the description if not explicitly stated) is fair.
- **Price Reasoning (\`priceReasoning\`):** Explain your reasoning. Reference the comparable items found by the tool. For example: "The asking price is slightly high compared to similar vintage cameras found on eBay, which range from $50 to $120." If the tool returns no relevant items, state that you could not determine price fairness due to a lack of comparable data.

**4. Seller Reliability (\`sellerReliability\`)**
- **Reliability Score (\`reliabilityScore\`):** Provide a score from 0 to 100.
  - Base this on signals within the description. High scores come from detailed information, clear return policies (if mentioned), and a professional tone. Low scores may result from pressure tactics ("buy now!"), vague details, or a lack of information.
- **Is Reliable Seller (\`isReliableSeller\`):** Based on the score, determine if the seller appears reliable.
- **Reliability Reasoning (\`reliabilityReasoning\`):** Explain your reasoning based on the content of the description. For example: "The seller provides a detailed history of the item and mentions a return policy, which are positive signals." or "The description is sparse and uses urgent language, which advises caution."

Adhere strictly to the output JSON schema.`,
});

const analyzeListingFlow = ai.defineFlow(
  {
    name: 'analyzeListingFlow',
    inputSchema: AnalyzeListingInputSchema,
    outputSchema: AnalyzeListingOutputSchema,
    tools: [ebaySearchTool],
  },
  async input => {
    const {output} = await analyzeListingPrompt(input);
    return output!;
  }
);
