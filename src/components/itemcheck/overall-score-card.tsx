'use client';
import * as React from 'react';
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';

const CustomProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
CustomProgress.displayName = "CustomProgress";


interface OverallScoreCardProps {
  overallScore: AnalyzeListingOutput['overallScore'];
}

export function OverallScoreCard({ overallScore }: OverallScoreCardProps) {
  const { score, reason } = overallScore;
  const percentage = score * 10;

  const getScoreRingColorClass = (value: number) => {
    if (value >= 80) return 'bg-primary/20 text-primary';
    if (value >= 50) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-destructive/20 text-destructive';
  };
  
  const getScoreBgColorClass = (value: number) => {
    if (value >= 80) return 'bg-primary';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-destructive';
  }


  return (
    <Card className="shadow-lg bg-card/80 border-border/60">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">Overall Analysis</CardTitle>
        <CardDescription className="text-muted-foreground">{reason}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div
            className={cn(
              "flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full text-4xl font-bold",
              getScoreRingColorClass(percentage)
            )}
          >
            <div className={cn("flex h-20 w-20 items-center justify-center rounded-full text-primary-foreground", getScoreBgColorClass(percentage))}>
              {score}
            </div>
          </div>
          <div className="w-full">
            <CustomProgress value={percentage} />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0</span>
                <span>5</span>
                <span>10</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
