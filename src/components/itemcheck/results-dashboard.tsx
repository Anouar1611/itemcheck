'use client';

import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';
import { OverallScoreCard } from './overall-score-card';
import { PriceCard } from './price-card';
import { QualityCard } from './quality-card';
import { ReliabilityCard } from './reliability-card';
import { ExtractedInfoCard } from './extracted-info-card';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface ResultsDashboardProps {
  analysis: AnalyzeListingOutput;
}

export function ResultsDashboard({ analysis }: ResultsDashboardProps) {
  if (!analysis) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>No Results</CardTitle>
                <CardDescription>The analysis could not be completed.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  const { overallScore, priceFairness, listingQuality, sellerReliability, extractedInfo } = analysis;

  return (
    <div className="space-y-6">
      <OverallScoreCard overallScore={overallScore} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PriceCard priceFairness={priceFairness} />
        <QualityCard listingQuality={listingQuality} />
        <ReliabilityCard sellerReliability={sellerReliability} />
      </div>

      <ExtractedInfoCard extractedInfo={extractedInfo} />
    </div>
  );
}
