'use server';

import {
  analyzeListing,
  type AnalyzeListingInput,
  type AnalyzeListingOutput,
} from '@/ai/flows/analyze-listing-flow';
import {
  analyzeImageForDamage,
  type AnalyzeImageForDamageInput,
  type AnalyzeImageForDamageOutput,
} from '@/ai/flows/analyze-image-damage-flow';

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

export async function handleAnalyzeImageForDamage(
  input: AnalyzeImageForDamageInput
): Promise<AnalyzeImageForDamageOutput> {
  try {
    const result = await analyzeImageForDamage(input);
    return result;
  } catch (error) {
    console.error('Error analyzing image for damage:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}
