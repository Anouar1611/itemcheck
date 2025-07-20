// @ts-nocheck
// TODO: Fix types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Zap, Lightbulb } from "lucide-react";
import type { AnalyzeListingOutput } from "@/ai/flows/analyze-listing";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface QualityCardProps {
  qualityData: AnalyzeListingOutput['listingQuality'];
}

export function QualityCard({ qualityData }: QualityCardProps) {
  const score = qualityData.qualityScore || 0;
  const chartData = [{ name: "Quality", score: score }];

  let scoreColor = "hsl(var(--foreground))"; // Default
  if (score >= 75) scoreColor = "hsl(var(--primary))";
  else if (score >= 50) scoreColor = "hsl(var(--accent))";
  else scoreColor = "hsl(var(--destructive))";
  
  const chartConfig = {
    score: {
      label: "Score",
      color: scoreColor,
    },
  } satisfies Parameters<typeof ChartContainer>[0]["config"];


  return (
    <Card className="shadow-lg bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Award className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl text-foreground">Listing Quality</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">Assessment of the listing's presentation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[100px] w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                cursor={{ fill: "hsla(var(--muted), 0.5)" }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="score" layout="vertical" radius={5} barSize={35}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={scoreColor} />
                  ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        <p className="text-center text-3xl font-bold" style={{ color: scoreColor }}>
          {score}
          <span className="text-xl text-muted-foreground">/100</span>
        </p>
        
        {qualityData.qualityAssessment && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center text-foreground"><Zap className="w-5 h-5 mr-2 text-accent"/>Assessment</h4>
            <p className="text-sm text-muted-foreground bg-input p-3 rounded-md border border-border/50">{qualityData.qualityAssessment}</p>
          </div>
        )}

        {qualityData.suggestions && (
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center text-foreground"><Lightbulb className="w-5 h-5 mr-2 text-primary"/>Suggestions for Improvement</h4>
            <p className="text-sm text-muted-foreground bg-input p-3 rounded-md border border-border/50">{qualityData.suggestions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
