'use server';

import {
  analyzeListing,
  type AnalyzeListingInput,
  type AnalyzeListingOutput,
} from '@/ai/flows/analyze-listing-flow';

export async function handleAnalyzeListing(
  input: AnalyzeListingInput
): Promise<AnalyzeListingOutput> {
  try {
    const result = await analyzeListing(input);
    return result;
  } catch (error) {
    console.error('Error analyzing listing:', error);
    throw new Error('Failed to analyze listing. Please try again.');
  }
}
