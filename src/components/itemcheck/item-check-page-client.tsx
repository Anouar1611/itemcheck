// @ts-nocheck
// TODO: Fix types
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ScanSearch } from 'lucide-react';

import { ListingUploadForm } from './listing-upload-form';
import { ResultsDashboard } from './results-dashboard';
import { handleAnalyzeListing } from '@/app/actions';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  listingImage: z.any().refine(value => value instanceof File || typeof value === 'string', { // Allow File for initial upload, string if pre-filled
    message: "Listing image is required.",
  }).or(z.instanceof(File)),
  description: z.string().min(20, "Description must be at least 20 characters long."),
});

type FormData = z.infer<typeof formSchema>;

export default function ItemCheckPageClient() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeListingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors }, reset, setValue, trigger } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      listingImage: null,
    },
  });

  useEffect(() => {
    // For react-hook-form, file input needs to be handled specially
    // We set the value for validation purposes and clear it if needed
    setValue('listingImage', imageFile); 
    if(imageFile) trigger('listingImage'); // Trigger validation if file is set
  }, [imageFile, setValue, trigger]);


  const onSubmit = async (data: FormData) => {
    if (!imageFile) {
      setError("Please upload an image.");
      toast({
        title: "Image Required",
        description: "Please upload an image for analysis.",
        variant: "destructive",
      });
      // Manually set error for image if not handled by zod resolver for file object
      setValue('listingImage', null, { shouldValidate: true });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const imageDataUri = reader.result as string;
        const result = await handleAnalyzeListing({
          image: imageDataUri,
          description: data.description,
        });
        setAnalysisResult(result);
        toast({
          title: "Analysis Complete",
          description: "Listing analysis finished successfully.",
        });
      };
      reader.onerror = () => {
        throw new Error("Failed to read image file.");
      };
    } catch (e: any) {
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setImagePreview(null);
    setImageFile(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4 md:px-6 border-b border-border shadow-sm sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto flex items-center gap-3">
          <ScanSearch className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">ItemCheck AI</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12">
        <ListingUploadForm
          onSubmit={handleSubmit(onSubmit)}
          control={control}
          errors={errors}
          isLoading={isLoading}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          setImageFile={setImageFile}
        />

        {isLoading && (
          <div className="mt-12 space-y-8">
            <CardSkeleton />
            <div className="grid md:grid-cols-2 gap-8">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 text-center p-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {analysisResult && !isLoading && (
          <>
            <ResultsDashboard analysisResult={analysisResult} />
            <div className="mt-12 text-center">
              <Button onClick={handleReset} variant="outline" size="lg">
                Analyze Another Item
              </Button>
            </div>
          </>
        )}
      </main>
      
      <footer className="py-6 px-4 md:px-6 border-t border-border mt-auto">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ItemCheck AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const CardSkeleton = () => (
  <div className="p-6 border rounded-lg shadow-sm bg-card">
    <Skeleton className="h-8 w-1/2 mb-4" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-6" />
    <Skeleton className="h-10 w-full" />
  </div>
);
