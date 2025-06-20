// @ts-nocheck
// TODO: Fix types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react"; 
import type { AnalyzeListingOutput } from "@/ai/flows/analyze-listing";

interface OverallScoreCardProps {
  analysisResult: AnalyzeListingOutput;
}

export function OverallScoreCard({ analysisResult }: OverallScoreCardProps) {
  const { listingQuality, sellerReliability } = analysisResult;
  const overallScore = Math.round((listingQuality.qualityScore + sellerReliability.reliabilityScore) / 2);

  let scoreColorClass = "text-foreground"; 
  let progressColorClass = "[&>div]:bg-foreground"; 

  if (overallScore >= 75) {
    scoreColorClass = "text-primary";
    progressColorClass = "[&>div]:bg-primary";
  } else if (overallScore >= 50) {
    scoreColorClass = "text-accent"; // Using accent for medium scores
    progressColorClass = "[&>div]:bg-accent";
  } else {
    scoreColorClass = "text-destructive";
    progressColorClass = "[&>div]:bg-destructive";
  }

  return (
    <Card className="shadow-xl bg-card border-2 border-primary/30">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Target className={`h-10 w-10 ${scoreColorClass}`} />
          <CardTitle className="text-3xl">Overall Item Score</CardTitle>
        </div>
        <CardDescription className="text-md">A combined measure of listing quality and seller reliability.</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-3">
        <p className={`text-7xl font-bold ${scoreColorClass}`}>{overallScore}<span className="text-4xl text-muted-foreground">/100</span></p>
        <Progress value={overallScore} className={`h-4 w-3/4 mx-auto ${progressColorClass}`} />
        <p className="text-sm text-muted-foreground pt-2">
          {overallScore >= 75 ? "This listing looks promising!" : overallScore >= 50 ? "Proceed with some caution." : "Consider this listing carefully."}
        </p>
      </CardContent>
    </Card>
  );
}
