
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
  const overallScore = Math.round(((listingQuality.qualityScore || 0) + (sellerReliability.reliabilityScore || 0)) / 2);

  let scoreColorClass = "text-[hsl(var(--foreground))]"; 
  let progressBgColor = "hsl(var(--foreground))"; 

  if (overallScore >= 75) {
    scoreColorClass = "text-[hsl(var(--primary))]";
    progressBgColor = "hsl(var(--primary))";
  } else if (overallScore >= 50) {
    scoreColorClass = "text-[hsl(var(--accent))]"; 
    progressBgColor = "hsl(var(--accent))";
  } else {
    scoreColorClass = "text-[hsl(var(--destructive))]";
    progressBgColor = "hsl(var(--destructive))";
  }

  return (
    <Card className="shadow-xl bg-card border-border md:col-span-2 lg:col-span-1"> {/* Adjusted span for better layout control */}
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Target className={`h-10 w-10 ${scoreColorClass.replace('text-[','').replace(']','')}`} />
          <CardTitle className="text-3xl text-card-foreground">Overall Item Score</CardTitle>
        </div>
        <CardDescription className="text-md text-muted-foreground">A combined measure of listing quality and seller reliability.</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-3">
        <p className={`text-7xl font-bold ${scoreColorClass}`}>{overallScore}<span className="text-4xl text-muted-foreground">/100</span></p>
        <Progress value={overallScore} className="h-4 w-3/4 mx-auto [&>div]:bg-[--progress-color]" style={{ '--progress-color': progressBgColor } as React.CSSProperties} />
        <p className="text-sm text-muted-foreground pt-2">
          {overallScore >= 75 ? "This listing looks promising!" : overallScore >= 50 ? "Proceed with some caution." : "Consider this listing carefully."}
        </p>
      </CardContent>
    </Card>
  );
}
