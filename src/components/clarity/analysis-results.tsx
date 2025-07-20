import type { AnalyzeTextForBiasOutput } from '@/ai/flows/analyze-text-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: AnalyzeTextForBiasOutput;
  extractedText?: string;
}

const ResultPill = ({
  isPresent,
  text,
}: {
  isPresent: boolean;
  text: string;
}) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      isPresent
        ? 'bg-destructive/10 text-destructive'
        : 'bg-green-100 dark:bg-green-900/50 dark:text-green-300 text-green-800'
    }`}
  >
    {isPresent ? (
      <AlertTriangle className="mr-1.5 h-4 w-4" />
    ) : (
      <CheckCircle className="mr-1.5 h-4 w-4" />
    )}
    {text}
  </span>
);

const DetailCard = ({
  title,
  isPresent,
  evidence,
  explanation,
}: {
  title: string;
  isPresent: boolean;
  evidence?: string;
  explanation?: string;
}) => {
  if (!isPresent) return null;

  return (
    <div>
      <h4 className="font-semibold text-lg text-foreground mb-1">{title}</h4>
      {evidence && (
        <blockquote className="border-l-4 border-primary pl-4 italic my-2 text-muted-foreground">
          "{evidence}"
        </blockquote>
      )}
      <p className="text-foreground/90">{explanation}</p>
    </div>
  );
};

export function AnalysisResults({ analysis, extractedText }: AnalysisResultsProps) {
  const { summary, biases, contradictions } = analysis;

  const anyBiasDetected = biases.political.isPresent || biases.gender.isPresent || biases.confirmation.isPresent;

  if (summary.startsWith('No text could be extracted')) {
    return (
       <div className="text-center py-10">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-2 text-lg font-medium text-foreground">Analysis Error</h3>
            <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       {extractedText && (
        <Card className="shadow-md dark:bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary" />
              Extracted Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground bg-accent p-4 rounded-md border">{extractedText}</p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md dark:bg-card">
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>{summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <ResultPill isPresent={anyBiasDetected} text={anyBiasDetected ? "Bias Detected" : "No Bias Detected"} />
          <ResultPill isPresent={contradictions.isContradictory} text={contradictions.isContradictory ? "Contradiction Found" : "No Contradictions Found"}/>
        </CardContent>
      </Card>

      {(anyBiasDetected || contradictions.isContradictory) && (
        <Card className="shadow-md dark:bg-card">
          <CardHeader>
            <CardTitle>Detailed Findings</CardTitle>
            <CardDescription>
              Here's a breakdown of the issues found in the text.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DetailCard
              title="Political Bias"
              isPresent={biases.political.isPresent}
              evidence={biases.political.evidence}
              explanation={biases.political.explanation}
            />
            <DetailCard
              title="Gender Bias"
              isPresent={biases.gender.isPresent}
              evidence={biases.gender.evidence}
              explanation={biases.gender.explanation}
            />
            <DetailCard
              title="Confirmation Bias"
              isPresent={biases.confirmation.isPresent}
              evidence={biases.confirmation.evidence}
              explanation={biases.confirmation.explanation}
            />
            <DetailCard
              title="Internal Contradiction"
              isPresent={contradictions.isContradictory}
              evidence={contradictions.contradiction}
              explanation={contradictions.explanation}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
