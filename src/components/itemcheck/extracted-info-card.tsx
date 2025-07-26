'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';

interface ExtractedInfoCardProps {
  extractedInfo: AnalyzeListingOutput['extractedInfo'];
}

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    )
}

export function ExtractedInfoCard({ extractedInfo }: ExtractedInfoCardProps) {
  const { itemCondition, brand, model } = extractedInfo;

  const hasInfo = itemCondition || brand || model;

  if (!hasInfo) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="text-primary" />
          <span>Extracted Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
            <InfoRow label="Condition" value={itemCondition} />
            <InfoRow label="Brand" value={brand} />
            <InfoRow label="Model" value={model} />
        </div>
      </CardContent>
    </Card>
  );
}
