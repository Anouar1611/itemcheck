// @ts-nocheck
// TODO: Fix types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, MessageCircleMore } from "lucide-react";
import type { AnalyzeListingOutput } from "@/ai/flows/analyze-listing";

interface ReliabilityCardProps {
  reliabilityData: AnalyzeListingOutput['sellerReliability'];
}

export function ReliabilityCard({ reliabilityData }: ReliabilityCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Seller Reliability</CardTitle>
        </div>
         <CardDescription>Assessment of the seller's trustworthiness based on available signals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-muted-foreground">Reliability Score</p>
            <p className="text-lg font-bold text-primary">{reliabilityData.reliabilityScore}/100</p>
          </div>
          <Progress value={reliabilityData.reliabilityScore} className="h-3 [&>div]:bg-primary" />
        </div>

        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-muted-foreground">Seller Assessment:</p>
          <Badge variant={reliabilityData.isReliableSeller ? "default" : "destructive"}>
            {reliabilityData.isReliableSeller ? "Appears Reliable" : "Caution Advised"}
          </Badge>
        </div>
        
        {reliabilityData.reliabilityReasoning && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center"><MessageCircleMore className="w-5 h-5 mr-2 text-accent"/>Reasoning</h4>
            <p className="text-sm text-foreground/80 bg-secondary/50 p-3 rounded-md">{reliabilityData.reliabilityReasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
