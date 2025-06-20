
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
    <div className="space-y-6 md:space-y-8 mt-8 md:mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <OverallScoreCard analysisResult={analysisResult} />
        <QualityCard qualityData={analysisResult.listingQuality} />
        <ReliabilityCard reliabilityData={analysisResult.sellerReliability} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <PriceCard priceData={analysisResult.priceFairness} />
        <ExtractedInfoCard extractedInfo={analysisResult.extractedInformation} />
      </div>
    </div>
  );
}
