// @ts-nocheck
// TODO: Fix types
"use server";

import { analyzeListing, type AnalyzeListingInput, type AnalyzeListingOutput } from "@/ai/flows/analyze-listing";

export async function handleAnalyzeListing(input: AnalyzeListingInput): Promise<AnalyzeListingOutput> {
  try {
    const result = await analyzeListing(input);
    return result;
  } catch (error) {
    console.error("Error analyzing listing:", error);
    // It's better to throw a custom error or return a structured error response
    throw new Error("Failed to analyze listing. Please try again.");
  }
}
