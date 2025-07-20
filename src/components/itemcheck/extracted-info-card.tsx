// @ts-nocheck
// TODO: Fix types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info, FileText } from "lucide-react";
import type { AnalyzeListingOutput } from "@/ai/flows/analyze-listing";

interface ExtractedInfoCardProps {
  extractedInfo: AnalyzeListingOutput['extractedInformation'];
}

export function ExtractedInfoCard({ extractedInfo }: ExtractedInfoCardProps) {
  return (
    <Card className="shadow-lg bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl text-foreground">Extracted Information</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">Key details identified from the listing's image and description.</CardDescription>
      </CardHeader>
      <CardContent>
        {extractedInfo ? (
          <p className="text-sm text-muted-foreground bg-input p-4 rounded-md whitespace-pre-wrap border border-border/50">{extractedInfo}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No specific information extracted or provided.</p>
        )}
      </CardContent>
    </Card>
  );
}
