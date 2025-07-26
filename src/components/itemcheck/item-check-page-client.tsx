"use client";

import { useState } from 'react';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';
import type { AnalyzeImageForDamageOutput } from '@/ai/flows/analyze-image-damage-flow';
import { ListingUploadForm } from './listing-upload-form';
import { ResultsDashboard } from './results-dashboard';
import { Button } from '../ui/button';
import { DamageReportCard } from './damage-report-card';

export function ItemCheckPageClient() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeListingOutput | null>(null);
  const [damageReport, setDamageReport] = useState<AnalyzeImageForDamageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setAnalysisResult(null);
    setDamageReport(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg font-medium text-foreground">Analyzing your listing...</p>
        <p className="text-sm text-muted-foreground">This may take a moment.</p>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <div>
        <ResultsDashboard analysis={analysisResult} />
        <Button onClick={handleReset} variant="outline" className="w-full mt-6 text-base py-6">
          Analyze Another Listing
        </Button>
      </div>
    );
  }
  
  if (damageReport) {
     return (
      <div>
        <DamageReportCard report={damageReport} />
        <Button onClick={handleReset} variant="outline" className="w-full mt-6 text-base py-6">
          Analyze Another Image
        </Button>
      </div>
    );
  }

  return (
    <ListingUploadForm
      setIsLoading={setIsLoading}
      setAnalysisResult={setAnalysisResult}
      setDamageReport={setDamageReport}
      setError={setError}
    />
  );
}
