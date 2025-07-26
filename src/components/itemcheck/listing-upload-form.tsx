'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleAnalyzeListing } from '@/app/actions';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';
import { Loader2, ScanSearch } from 'lucide-react';

const formSchema = z.object({
  listingUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  description: z.string().min(20, 'Please enter at least 20 characters for the description.'),
});

type FormData = z.infer<typeof formSchema>;

interface ListingUploadFormProps {
  setIsLoading: (isLoading: boolean) => void;
  setAnalysisResult: (result: AnalyzeListingOutput | null) => void;
  setError: (error: string | null) => void;
}

export function ListingUploadForm({
  setIsLoading,
  setAnalysisResult,
  setError,
}: ListingUploadFormProps) {
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listingUrl: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const result = await handleAnalyzeListing(data);
      setAnalysisResult(result);
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({ title: 'Analysis Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-border/60 bg-card/80">
      <CardHeader className="text-center">
        <ScanSearch className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-3xl font-bold mt-2">
          ItemCheck AI Analyzer
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Get an instant AI-powered analysis of any marketplace listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="listingUrl">Listing URL (Optional)</Label>
             <Controller
              name="listingUrl"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="listingUrl"
                  placeholder="https://www.ebay.com/itm/..."
                  className="bg-input"
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.listingUrl && <p className="text-sm text-destructive">{errors.listingUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Listing Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Copy and paste the full item description here..."
                  className={`min-h-[150px] text-base resize-y bg-input ${errors.description ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <Button variant="accent" type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Analyzing...' : 'Analyze Listing'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
