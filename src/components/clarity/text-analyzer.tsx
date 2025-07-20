'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAnalyzeText } from '@/app/actions';
import type { AnalyzeTextForBiasOutput } from '@/ai/flows/analyze-text-flow';
import { AnalysisResults } from './analysis-results';

const formSchema = z.object({
  text: z.string().min(20, 'Please enter at least 20 characters to analyze.'),
});

type FormData = z.infer<typeof formSchema>;

export function TextAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTextForBiasOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await handleAnalyzeText(data);
      setAnalysisResult(result);
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      toast({ title: 'Analysis Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset({ text: '' });
    setAnalysisResult(null);
  };

  return (
    <Card className="w-full shadow-lg border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-6 w-6 text-primary" />
          Text Analyzer
        </CardTitle>
        <CardDescription>Paste text below to scan for biases and contradictions.</CardDescription>
      </CardHeader>
      <CardContent>
        {!analysisResult ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Enter or paste text here..."
                  className={`min-h-[200px] text-base resize-y ${errors.text ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
              )}
            />
            {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Analyzing...' : 'Analyze Text'}
            </Button>
          </form>
        ) : (
          <div>
            <AnalysisResults analysis={analysisResult} />
            <Button onClick={handleReset} variant="outline" className="w-full mt-4">
              Analyze New Text
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
