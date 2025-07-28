'use client';

import { useState } from 'react';
import type { ProductSearchOutput } from '@/ai/flows/product-search-and-analysis-flow';
import { SearchForm } from './search-form';
import { SearchResults } from './search-results';
import { Button } from '@/components/ui/button';

export function SearchPageClient() {
  const [searchResult, setSearchResult] = useState<ProductSearchOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setSearchResult(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg font-medium text-foreground">
          Searching for the best deals...
        </p>
        <p className="text-sm text-muted-foreground">
          This may take a moment.
        </p>
      </div>
    );
  }

  if (searchResult) {
    return (
      <div>
        <SearchResults results={searchResult} />
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full mt-6 text-base py-6"
        >
          Start New Search
        </Button>
      </div>
    );
  }

  return (
    <SearchForm
      setIsLoading={setIsLoading}
      setSearchResult={setSearchResult}
      setError={setError}
    />
  );
}
