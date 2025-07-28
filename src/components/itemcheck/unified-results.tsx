'use client';

import type { AnalyzeOrSearchOutput } from '@/ai/flows/analyze-or-search-flow';
import { ResultsDashboard } from './results-dashboard';
import { SearchResults } from '../search/search-results';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface UnifiedResultsProps {
  result: AnalyzeOrSearchOutput;
}

export function UnifiedResults({ result }: UnifiedResultsProps) {
  if (result.analysisType === 'listing' && result.listingAnalysis) {
    return <ResultsDashboard analysis={result.listingAnalysis} />;
  }

  if (result.analysisType === 'search' && result.productSearch) {
    return <SearchResults results={result.productSearch} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>No Results</CardTitle>
        <CardDescription>
          The analysis could not be completed or returned an unexpected format.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
