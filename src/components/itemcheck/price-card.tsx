'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';

interface PriceCardProps {
  priceFairness: AnalyzeListingOutput['priceFairness'];
}

export function PriceCard({ priceFairness }: PriceCardProps) {
  const { isFair, marketValue, reason } = priceFairness;
  
  const badgeVariant = isFair ? 'default' : 'destructive';
  const badgeClass = isFair ? 'bg-primary/20 text-primary-foreground' : 'bg-destructive/20 text-destructive-foreground';

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="text-primary" />
          <span>Price Fairness</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {isFair ? (
            <CheckCircle className="h-6 w-6 text-primary" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          )}
          <Badge variant={badgeVariant} className={badgeClass}>
            {isFair ? 'Fair Price' : 'Potentially Unfair'}
          </Badge>
        </div>
        
        {marketValue && (
          <div className="text-lg">
            Estimated Market Value: <span className="font-semibold text-primary">{marketValue}</span>
          </div>
        )}

        <p className="text-sm text-muted-foreground">{reason}</p>
      </CardContent>
    </Card>
  );
}
