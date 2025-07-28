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
import {
  productSearchAndAnalysis,
  type ProductSearchInput,
  type ProductSearchOutput,
} from '@/ai/flows/product-search-and-analysis-flow';
import {
  analyzeOrSearch,
  type AnalyzeOrSearchInput,
  type AnalyzeOrSearchOutput,
} from '@/ai/flows/analyze-or-search-flow';

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

export async function handleProductSearch(
  input: ProductSearchInput
): Promise<ProductSearchOutput> {
  try {
    const result = await productSearchAndAnalysis(input);
    return result;
  } catch (error) {
    console.error('Error in product search and analysis:', error);
    throw new Error(
      'Failed to perform product search and analysis. Please try again.'
    );
  }
}

export async function handleAnalyzeOrSearch(
  input: AnalyzeOrSearchInput
): Promise<AnalyzeOrSearchOutput> {
  try {
    const result = await analyzeOrSearch(input);
    return result;
  } catch (error) {
    console.error('Error in unified analysis/search:', error);
    throw new Error('Failed to complete your request. Please try again.');
  }
}
