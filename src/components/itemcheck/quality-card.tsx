// @ts-nocheck
// TODO: Fix types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Zap, Lightbulb } from "lucide-react";
import type { AnalyzeListingOutput } from "@/ai/flows/analyze-listing";

interface QualityCardProps {
  qualityData: AnalyzeListingOutput['listingQuality'];
}

export function QualityCard({ qualityData }: QualityCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Award className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Listing Quality</CardTitle>
        </div>
        <CardDescription>Assessment of the listing's overall quality and presentation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-muted-foreground">Quality Score</p>
            <p className="text-lg font-bold text-primary">{qualityData.qualityScore}/100</p>
          </div>
          <Progress value={qualityData.qualityScore} className="h-3 [&>div]:bg-primary" />
        </div>
        
        {qualityData.qualityAssessment && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center"><Zap className="w-5 h-5 mr-2 text-accent"/>Assessment</h4>
            <p className="text-sm text-foreground/80 bg-secondary/50 p-3 rounded-md">{qualityData.qualityAssessment}</p>
          </div>
        )}

        {qualityData.suggestions && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-primary"/>Suggestions for Improvement</h4>
            <p className="text-sm text-foreground/80 bg-secondary/50 p-3 rounded-md">{qualityData.suggestions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
