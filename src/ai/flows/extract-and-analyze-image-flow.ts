/**
 * @fileOverview An AI flow for extracting text from an image and analyzing it for biases.
 *
 * - extractAndAnalyzeImage - Extracts text from an image and analyzes it.
 * - ExtractAndAnalyzeImageInput - The input type for the extractAndAnalyzeImage function.
 * - ExtractAndAnalyzeImageOutput - The return type for the extractAndAnalyzeImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  analyzeTextForBias,
  AnalyzeTextForBiasOutputSchema,
} from './analyze-text-flow';

export const ExtractAndAnalyzeImageInputSchema = z.object({
  image: z
    .string()
    .describe(
      "An image containing text (e.g., a screenshot) as a data URI. Format: 'data:image/jpeg;base64,...'"
    ),
});
export type ExtractAndAnalyzeImageInput = z.infer<
  typeof ExtractAndAnalyzeImageInputSchema
>;

export const ExtractAndAnalyzeImageOutputSchema = z.object({
  extractedText: z.string().describe('The text that was extracted from the image.'),
  analysis: AnalyzeTextForBiasOutputSchema,
});
export type ExtractAndAnalyzeImageOutput = z.infer<
  typeof ExtractAndAnalyzeImageOutputSchema
>;

export async function extractAndAnalyzeImage(
  input: ExtractAndAnalyzeImageInput
): Promise<ExtractAndAnalyzeImageOutput> {
  return extractAndAnalyzeImageFlow(input);
}

// This is a multi-modal prompt that can "see" the image and extract text.
const extractTextFromImagePrompt = ai.definePrompt({
  name: 'extractTextFromImagePrompt',
  input: { schema: ExtractAndAnalyzeImageInputSchema },
  output: { schema: z.object({ extractedText: z.string() }) },
  prompt: `You are an expert Optical Character Recognition (OCR) tool. Extract all text from the provided image. Provide only the text, with no additional commentary.

Image: {{media url=image}}
`,
});

const extractAndAnalyzeImageFlow = ai.defineFlow(
  {
    name: 'extractAndAnalyzeImageFlow',
    inputSchema: ExtractAndAnalyzeImageInputSchema,
    outputSchema: ExtractAndAnalyzeImageOutputSchema,
  },
  async (input) => {
    // Step 1: Extract text from the image using a multi-modal model.
    const { output: ocrOutput } = await extractTextFromImagePrompt(input);
    const extractedText = ocrOutput?.extractedText || '';

    if (!extractedText) {
      // If no text is found, we can't analyze it.
      // We'll return a result indicating this, which the frontend should handle.
      return {
        extractedText: '',
        analysis: {
          summary: 'No text could be extracted from the provided image.',
          biases: {
            political: { isPresent: false },
            gender: { isPresent: false },
            confirmation: { isPresent: false },
          },
          contradictions: { isContradictory: false },
        },
      };
    }

    // Step 2: Analyze the extracted text using the dedicated text analysis flow.
    const analysis = await analyzeTextForBias({ text: extractedText });

    // Step 3: Combine the results.
    return {
      extractedText,
      analysis,
    };
  }
);
