'use server';

import {
  analyzeTextForBias,
  type AnalyzeTextForBiasInput,
  type AnalyzeTextForBiasOutput,
} from '@/ai/flows/analyze-text-flow';
import {
  extractAndAnalyzeImage,
  type ExtractAndAnalyzeImageInput,
  type ExtractAndAnalyzeImageOutput,
} from '@/ai/flows/extract-and-analyze-image-flow';

export async function handleAnalyzeText(
  input: AnalyzeTextForBiasInput
): Promise<AnalyzeTextForBiasOutput> {
  try {
    const result = await analyzeTextForBias(input);
    return result;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw new Error('Failed to analyze text. Please try again.');
  }
}

export async function handleAnalyzeImage(
  input: ExtractAndAnalyzeImageInput
): Promise<ExtractAndAnalyzeImageOutput> {
  try {
    const result = await extractAndAnalyzeImage(input);
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}
