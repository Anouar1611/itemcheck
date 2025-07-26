'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';

interface QualityCardProps {
  listingQuality: AnalyzeListingOutput['listingQuality'];
}

export function QualityCard({ listingQuality }: QualityCardProps) {
  const { score, reason, strengths, weaknesses, suggestions } = listingQuality;

  const chartData = [{ name: 'Quality', score: score }];
  const chartColor = score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="text-primary" />
          <span>Listing Quality</span>
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

        <div>
          {strengths.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2"><ThumbsUp className="h-4 w-4 text-green-500" />Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {strengths.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2"><ThumbsDown className="h-4 w-4 text-red-500" />Weaknesses</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {weaknesses.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          
          {suggestions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-blue-500" />Suggestions</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {suggestions.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
