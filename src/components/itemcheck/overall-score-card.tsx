'use client';
import * as React from 'react';
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';

// Define a custom Progress component that can accept an indicatorClassName
const CustomProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
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

  const getScoreColorClass = (value: number) => {
    if (value >= 80) return 'bg-green-500'; // Using a distinct color for high scores
    if (value >= 50) return 'bg-yellow-500'; // Using a distinct color for medium scores
    return 'bg-destructive'; // Use theme's destructive color for low scores
  };
  
  const getScoreRingColorClass = (value: number) => {
    if (value >= 80) return 'bg-green-500/20 text-green-300';
    if (value >= 50) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-destructive/20 text-destructive-foreground';
  };

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
            <div className={cn("flex h-20 w-20 items-center justify-center rounded-full", getScoreColorClass(percentage), "text-primary-foreground")}>
              {score}
            </div>
          </div>
          <div className="w-full">
            <CustomProgress value={percentage} className="h-4" indicatorClassName={getScoreColorClass(percentage)} />
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
