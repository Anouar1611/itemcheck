'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';

interface ReliabilityCardProps {
  sellerReliability: AnalyzeListingOutput['sellerReliability'];
}

export function ReliabilityCard({ sellerReliability }: ReliabilityCardProps) {
  const { score, reason } = sellerReliability;

  const chartData = [{ name: 'Reliability', score: score }];
  const chartColor = score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="text-primary" />
          <span>Seller Reliability</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-1/3">
             <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ left: -30 }}>
                  <XAxis type="number" dataKey="score" hide domain={[0, 10]} />
                  <YAxis type="category" dataKey="name" hide />
                  <Bar dataKey="score" layout="vertical" radius={4}>
                     <Cell fill={chartColor} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="w-2/3">
            <p className="text-2xl font-bold">
              {score} <span className="text-base font-normal text-muted-foreground">/ 10</span>
            </p>
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">
            Note: This is an inferred score based on the listing's content and does not reflect actual seller ratings.
        </p>
      </CardContent>
    </Card>
  );
}
