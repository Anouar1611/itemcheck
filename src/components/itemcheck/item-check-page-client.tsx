// @ts-nocheck
// TODO: Fix types
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { ListingUploadForm } from './listing-upload-form';
import { ResultsDashboard } from './results-dashboard';
import { handleAnalyzeListing } from '@/app/actions';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card'; // Import Card for structure

const formSchema = z.object({
  listingImage: z.any().optional(),
  listingUrl: z.string().url({ message: "Please enter a valid listing URL." }).optional().or(z.literal("")),
  description: z.string().min(20, "Description must be at least 20 characters long."),
}).refine(data => {
  const hasImageFile = !!data.listingImage;
  const hasListingUrl = !!data.listingUrl && data.listingUrl.trim() !== '';
  return (hasImageFile || hasListingUrl);
}, {
  message: "Either an image upload or a listing URL is required, along with the description.",
  path: ["listingImage"],
});

type FormData = z.infer<typeof formSchema>;

export default function ItemCheckPageClient() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeListingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors }, reset, setValue, trigger, watch, setError: setFormError } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      listingImage: null,
      listingUrl: "",
    },
  });

  const watchedListingUrl = watch("listingUrl");
  const watchedListingImage = watch("listingImage");

  useEffect(() => {
    if (imageFile) {
      setValue('listingImage', imageFile, { shouldValidate: true });
      setValue('listingUrl', '', { shouldValidate: true });
      const newPreview = URL.createObjectURL(imageFile);
      setImagePreview(newPreview);
      const urlInput = document.getElementById('listingUrl') as HTMLInputElement;
      if (urlInput) urlInput.value = '';
    } else {
      setValue('listingImage', null, { shouldValidate: true });
      if (!watchedListingUrl) {
         setImagePreview(null);
      }
    }
    trigger(['listingImage', 'listingUrl']);

    let currentPreview = imagePreview;
    return () => {
        if (currentPreview && currentPreview.startsWith('blob:')) {
            URL.revokeObjectURL(currentPreview);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, setValue, trigger]);


  useEffect(() => {
    if (watchedListingUrl) {
      setImageFile(null); 
      setValue('listingImage', null, {shouldValidate: true});
      setImagePreview(null);
      const fileInput = document.getElementById('listingImage-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
    trigger(['listingImage', 'listingUrl']);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedListingUrl, setValue, trigger]);


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const hasImageFile = !!imageFile;
    const hasListingUrl = !!data.listingUrl && data.listingUrl.trim() !== '';

    if (!data.description) {
        setFormError("description", { type: "manual", message: "Description is required."});
        setIsLoading(false);
        return;
    }
    if (!hasImageFile && !hasListingUrl) {
        setFormError("listingImage", { type: "manual", message: "Either an image upload or a listing URL is required."});
        setIsLoading(false);
        return;
    }

    let imagePayloadForApi: string | undefined = undefined;

    if (imageFile) {
      try {
        imagePayloadForApi = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(new Error("Failed to read image file."));
        });
      } catch (e: any) {
        setError(e.message);
        toast({ title: "Image Read Error", description: e.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await handleAnalyzeListing({
        image: imagePayloadForApi,
        listingUrl: data.listingUrl || undefined,
        description: data.description,
      });
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Listing analysis finished successfully.",
      });
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
    setImageFile(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    const fileInput = document.getElementById('listingImage-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    const urlInput = document.getElementById('listingUrl') as HTMLInputElement;
    if (urlInput) urlInput.value = '';
  };

  return (
    <div className="min-h-full flex flex-col items-center">
      <ListingUploadForm
        onSubmit={handleSubmit(onSubmit)}
        control={control}
        errors={errors}
        isLoading={isLoading}
        imagePreview={imagePreview}
        setImageFile={setImageFile}
        currentListingUrl={watchedListingUrl} 
        uploadedFile={imageFile} 
      />

      {isLoading && (
        <div className="mt-8 md:mt-12 space-y-6 md:space-y-8 w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      )}
      
      {errors.listingImage && errors.listingImage.type === 'manual' && (
          <Card className="mt-6 bg-destructive/10 border-destructive text-destructive p-4 w-full max-w-3xl">
              <p className="text-sm font-medium text-center">{errors.listingImage.message?.toString()}</p>
          </Card>
      )}

      {error && (
        <Card className="mt-8 bg-destructive/10 border-destructive text-destructive p-4 w-full max-w-3xl">
          <p className="font-medium text-center">Error: {error}</p>
        </Card>
      )}

      {analysisResult && !isLoading && (
        <>
          <div className="w-full max-w-7xl">
            <ResultsDashboard analysisResult={analysisResult} />
          </div>
          <div className="mt-8 md:mt-12 text-center">
            <Button onClick={handleReset} variant="outline" size="lg" className="border-border hover:bg-muted text-lg py-6">
              Analyze Another Item
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const CardSkeleton = () => (
  <Card className="p-6 bg-card border-border/50 shadow-sm w-full">
    <Skeleton className="h-8 w-1/2 mb-4 bg-muted" />
    <Skeleton className="h-4 w-3/4 mb-6 bg-muted" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-5/6 bg-muted" />
    </div>
  </Card>
);
