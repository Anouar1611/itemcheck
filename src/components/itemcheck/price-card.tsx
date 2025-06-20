
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
  const isFair = priceData.isFairPrice;
  return (
    <Card className="shadow-lg bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Scale className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl text-card-foreground">Price Fairness</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">Evaluation of the listing price against market value.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-muted-foreground">Price Assessment:</p>
          <Badge variant={isFair ? "default" : "destructive"} className={isFair ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}>
            {isFair ? "Fair Price" : "Potentially Unfair"}
          </Badge>
        </div>

        {priceData.fairMarketValue && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center text-card-foreground"><BadgeDollarSign className="w-5 h-5 mr-2 text-primary"/>Fair Market Value</h4>
            <p className="text-lg font-bold text-foreground">{priceData.fairMarketValue}</p>
          </div>
        )}
        
        {priceData.priceReasoning && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center text-card-foreground"><MessageCircleQuestion className="w-5 h-5 mr-2 text-accent"/>Reasoning</h4>
            <p className="text-sm text-muted-foreground bg-input p-3 rounded-md">{priceData.priceReasoning}</p>
          </div>
        )}
         {!priceData.fairMarketValue && !priceData.priceReasoning && (
            <p className="text-sm text-muted-foreground">Price analysis data is not available for this listing.</p>
        )}
      </CardContent>
    </Card>
  );
}

