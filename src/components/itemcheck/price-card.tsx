// @ts-nocheck
// TODO: Fix types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, BadgeDollarSign, MessageCircleQuestion } from "lucide-react";
import type { AnalyzeListingOutput } from "@/ai/flows/analyze-listing";

interface PriceCardProps {
  priceData: AnalyzeListingOutput['priceFairness'];
}

export function PriceCard({ priceData }: PriceCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Scale className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Price Fairness</CardTitle>
        </div>
        <CardDescription>Evaluation of the listing price against market value.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-muted-foreground">Price Assessment:</p>
          <Badge variant={priceData.isFairPrice ? "default" : "destructive"} className={priceData.isFairPrice ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}>
            {priceData.isFairPrice ? "Fair Price" : "Potentially Unfair"}
          </Badge>
        </div>

        {priceData.fairMarketValue && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center"><BadgeDollarSign className="w-5 h-5 mr-2 text-blue-500"/>Fair Market Value</h4>
            <p className="text-lg font-bold text-foreground">{priceData.fairMarketValue}</p>
          </div>
        )}
        
        {priceData.priceReasoning && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center"><MessageCircleQuestion className="w-5 h-5 mr-2 text-purple-500"/>Reasoning</h4>
            <p className="text-sm text-foreground/80 bg-secondary/50 p-3 rounded-md">{priceData.priceReasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
