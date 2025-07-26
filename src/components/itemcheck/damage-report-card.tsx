import type { AnalyzeImageForDamageOutput } from '@/ai/flows/analyze-image-damage-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldCheck, Microscope, Siren } from 'lucide-react';

interface DamageReportCardProps {
  report: AnalyzeImageForDamageOutput;
}

export function DamageReportCard({ report }: DamageReportCardProps) {
  const { summary, issuesFound } = report;

  const hasIssues = issuesFound.length > 0;

  return (
    <Card className="shadow-lg bg-card/80 border-border/60 w-full">
      <CardHeader className="text-center border-b border-border/50 pb-4">
        <Microscope className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-bold mt-2">AI Damage Assessment</CardTitle>
        <CardDescription className="text-muted-foreground">
          {summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          {hasIssues ? (
            <>
              <Siren className="h-8 w-8 text-destructive" />
              <Badge variant="destructive" className="text-lg px-4 py-1">
                {issuesFound.length} Potential Issue{issuesFound.length > 1 ? 's' : ''} Found
              </Badge>
            </>
          ) : (
            <>
              <ShieldCheck className="h-8 w-8 text-primary" />
              <Badge variant="default" className="text-lg bg-primary/20 text-primary-foreground px-4 py-1">
                No Major Issues Detected
              </Badge>
            </>
          )}
        </div>
        
        {hasIssues && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Items to Note:</h3>
            <ul className="space-y-3">
              {issuesFound.map((issue, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">{issue.area}</p>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
