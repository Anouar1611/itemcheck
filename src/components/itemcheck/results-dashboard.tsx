// @ts-nocheck
// TODO: Fix types
import type { AnalyzeListingOutput } from "@/ai/flows/analyze-listing";
import { QualityCard } from "./quality-card";
import { PriceCard } from "./price-card";
import { ReliabilityCard } from "./reliability-card";
import { ExtractedInfoCard } from "./extracted-info-card";
import { OverallScoreCard } from "./overall-score-card";

interface ResultsDashboardProps {
  analysisResult: AnalyzeListingOutput;
}

export function ResultsDashboard({ analysisResult }: ResultsDashboardProps) {
  return (
    <div className="space-y-8 mt-12">
      <OverallScoreCard analysisResult={analysisResult} />
      
      <div className="grid md:grid-cols-2 gap-8">
        <QualityCard qualityData={analysisResult.listingQuality} />
        <PriceCard priceData={analysisResult.priceFairness} />
        <ReliabilityCard reliabilityData={analysisResult.sellerReliability} />
        <ExtractedInfoCard extractedInfo={analysisResult.extractedInformation} />
      </div>
    </div>
  );
}
