'use server';

/**
 * @fileOverview Assesses the quality of a listing based on image clarity, description length, and completeness.
 *
 * - assessListingQuality - A function that handles the listing quality assessment process.
 * - AssessListingQualityInput - The input type for the assessListingQuality function.
 * - AssessListingQualityOutput - The return type for the assessListingQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessListingQualityInputSchema = z.object({
  ocrText: z.string().describe('The OCR extracted text from the listing image.'),
  description: z.string().describe('The description of the listing.'),
  filledOutFields: z.string().describe('Comma separated list of the filled out fields in the listing form.'),
});
export type AssessListingQualityInput = z.infer<typeof AssessListingQualityInputSchema>;

const AssessListingQualityOutputSchema = z.object({
  qualityScore: z.number().describe('A score between 0 and 1 representing the overall quality of the listing.'),
  strengths: z.string().describe('A summary of the listing strengths.'),
  weaknesses: z.string().describe('A summary of the listing weaknesses.'),
  suggestions: z.string().describe('Suggestions for improving the listing.'),
});
export type AssessListingQualityOutput = z.infer<typeof AssessListingQualityOutputSchema>;

export async function assessListingQuality(input: AssessListingQualityInput): Promise<AssessListingQualityOutput> {
  return assessListingQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessListingQualityPrompt',
  input: {schema: AssessListingQualityInputSchema},
  output: {schema: AssessListingQualityOutputSchema},
  prompt: `You are an expert listing quality assessor.

You will be provided with the OCR extracted text from the listing image, the listing description, and the filled-out fields in the listing form.

Based on this information, you will assess the quality of the listing and provide a quality score between 0 and 1, a summary of the listing strengths and weaknesses, and suggestions for improving the listing.

OCR Text: {{{ocrText}}}
Description: {{{description}}}
Filled Out Fields: {{{filledOutFields}}}

Please provide listing quality score (between 0 and 1), strengths, weaknesses and suggestions to improve the listing.
`,
});

const assessListingQualityFlow = ai.defineFlow(
  {
    name: 'assessListingQualityFlow',
    inputSchema: AssessListingQualityInputSchema,
    outputSchema: AssessListingQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
