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
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

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

// Type for the history list items
export interface HistoryItem {
  id: string;
  query: string;
  analysisType: 'listing' | 'search';
  createdAt: string; // Storing as ISO string
  overallScore?: number; // For listing analysis
  recommendation?: boolean; // For search analysis
}

export async function getUserHistory(): Promise<HistoryItem[]> {
  const user = auth.currentUser;
  if (!user) {
    // This should not happen if the page is protected, but as a safeguard:
    return [];
  }

  try {
    const historyCollection = collection(db, `userHistory/${user.uid}/analyses`);
    const q = query(historyCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const history: HistoryItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        query: data.query,
        analysisType: data.analysisType,
        createdAt: new Date(data.createdAt.seconds * 1000).toISOString(),
        overallScore: data.listingAnalysis?.overallScore?.score,
        recommendation: data.productSearch?.overallVerdict?.isRecommended,
      });
    });
    return history;
  } catch (error) {
    console.error("Error fetching user history:", error);
    throw new Error("Failed to fetch analysis history.");
  }
}

export async function getHistoryItem(id: string): Promise<AnalyzeOrSearchOutput | null> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated.");
  }

  try {
    const docRef = doc(db, `userHistory/${user.uid}/analyses`, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // The data from Firestore needs to be cast to the correct type.
      // Firestore timestamps need to be handled, but for this mock, we assume they are compatible.
      const data = docSnap.data() as AnalyzeOrSearchOutput;
      return data;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching history document:", error);
    throw new Error("Failed to fetch analysis details.");
  }
}
