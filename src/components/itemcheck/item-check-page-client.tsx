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
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing'; // Will be updated by AI flow change
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Updated form schema
const formSchema = z.object({
  listingImage: z.any().optional(), // For File object from upload
  listingUrl: z.string().url({ message: "Please enter a valid listing URL." }).optional().or(z.literal("")),
  description: z.string().min(20, "Description must be at least 20 characters long."),
}).refine(data => {
  const hasImageFile = !!data.listingImage;
  const hasListingUrl = !!data.listingUrl && data.listingUrl.trim() !== '';
  return (hasImageFile || hasListingUrl); // Must have either an image upload or a listing URL
}, {
  message: "Either an image upload or a listing URL is required, along with the description.",
  path: ["listingImage"], // Attach root error to listingImage for display simplicity
});


type FormData = z.infer<typeof formSchema>;

export default function ItemCheckPageClient() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeListingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For uploaded image preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors }, reset, setValue, trigger, watch, setError: setFormError } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      listingImage: null,
      listingUrl: "", // Changed from imageUrl
    },
  });

  const watchedListingUrl = watch("listingUrl"); // Changed from imageUrl
  const watchedListingImage = watch("listingImage"); // This is the File object from RHF

  useEffect(() => {
    // When imageFile (File object from manual input) changes
    if (imageFile) {
      setValue('listingImage', imageFile, { shouldValidate: true }); // Set RHF value
      setValue('listingUrl', '', { shouldValidate: true }); // Clear listingUrl if file is added
      const newPreview = URL.createObjectURL(imageFile);
      setImagePreview(newPreview); // Create preview for uploaded file
      // No need to clear listingUrl input visually here, RHF takes care of it via setValue
    } else {
      // If imageFile is cleared (e.g., by user or by setting listingUrl)
      setValue('listingImage', null, { shouldValidate: true });
      // Only clear preview if no listingUrl is ALSO set to take over preview
      if (!watchedListingUrl) { // If listing URL is also empty, clear preview
         setImagePreview(null);
      }
    }
    trigger('listingImage');
    trigger('listingUrl');

    // Cleanup object URL
    let currentPreview = imagePreview;
    return () => {
        if (currentPreview && currentPreview.startsWith('blob:')) {
            URL.revokeObjectURL(currentPreview);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, setValue, trigger]);


  useEffect(() => {
    // When watchedListingUrl (URL input string) changes
    if (watchedListingUrl) {
      setImageFile(null); // Clear any uploaded file state
      setValue('listingImage', null, {shouldValidate: true}); // Clear RHF value for file upload
      setImagePreview(null); // Listing URL does not generate a preview in this component
      
      // Clear file input visually if it had a value
      const fileInput = document.getElementById('listingImage-file') as HTMLInputElement;
      if (fileInput && fileInput.value) fileInput.value = '';
    }
    // No else needed: if listingUrl is cleared, imageFile useEffect will handle preview if imageFile exists
    trigger('listingImage');
    trigger('listingUrl');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedListingUrl, setValue, trigger]);


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // Check refinement at submit time too for clarity, though Zod should catch it
    const hasImageFile = !!imageFile; // imageFile is our source of truth for upload
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

    if (imageFile) { // Prioritize uploaded file for the 'image' parameter to AI
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
        image: imagePayloadForApi, // This will be undefined if no file was uploaded
        listingUrl: data.listingUrl || undefined, // Pass listingUrl if provided
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
    reset(); // Resets RHF fields
    setImageFile(null); // Clears image file state, triggers useEffect to clear preview
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    const fileInput = document.getElementById('listingImage-file') as HTMLInputElement;
    if (fileInput) fileInput.value = ''; // Ensure visual file input is cleared
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12">
        <ListingUploadForm
          onSubmit={handleSubmit(onSubmit)}
          control={control}
          errors={errors}
          isLoading={isLoading}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview} 
          setImageFile={setImageFile}
          currentListingUrl={watchedListingUrl} 
          uploadedFile={imageFile} 
        />

        {isLoading && (
          <div className="mt-12 space-y-8">
            <CardSkeleton />
            <div className="grid md:grid-cols-2 gap-8">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        )}
        
        {/* Display root error from Zod refine if it exists and is for listingImage */}
        {errors.listingImage && errors.listingImage.type !== 'required' && (
            <div className="mt-4 text-center p-3 bg-destructive/10 text-destructive border border-destructive rounded-md">
                <p className="text-sm font-medium">{errors.listingImage.message?.toString()}</p>
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
      </div>
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