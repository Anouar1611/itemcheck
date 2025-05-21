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
import { Button } from "@/components/ui/button"; // Added Button import

const formSchema = z.object({
  listingImage: z.any().optional(), // Allow File for upload, or can be null/undefined if URL is used
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  description: z.string().min(20, "Description must be at least 20 characters long."),
}).refine(data => !!data.listingImage || !!data.imageUrl, {
  message: "Either an image upload or an image URL is required.",
  path: ["listingImage"], // You can choose which field to attach the error to, or a general form error
});

type FormData = z.infer<typeof formSchema>;

export default function ItemCheckPageClient() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeListingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors }, reset, setValue, trigger, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      listingImage: null,
      imageUrl: "",
    },
  });

  const watchedImageUrl = watch("imageUrl");
  const watchedListingImage = watch("listingImage"); // This will be the File object or null

  useEffect(() => {
    // When imageFile (File object from upload) changes
    if (imageFile) {
      setValue('listingImage', imageFile, { shouldValidate: true }); // Set RHF value for validation
      setValue('imageUrl', '', { shouldValidate: true }); // Clear URL if file is added
      setImagePreview(URL.createObjectURL(imageFile)); // Create preview for uploaded file
    } else {
      // If imageFile is cleared (e.g., by user removing it)
      setValue('listingImage', null, { shouldValidate: true });
      if (!watchedImageUrl) { // Only clear preview if no URL is set
        setImagePreview(null);
      }
    }
    // Trigger validation for both fields when imageFile changes
    trigger('listingImage');
    trigger('imageUrl');

    // Cleanup object URL
    return () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, setValue, trigger]); // Removed imagePreview from deps to avoid re-runs from its own update

  useEffect(() => {
    // When watchedImageUrl (URL input string) changes
    if (watchedImageUrl) {
      setImageFile(null); // Clear any uploaded file
      setValue('listingImage', null, {shouldValidate: true}); // Clear RHF value for file upload
      setImagePreview(watchedImageUrl); // Set preview to the URL
      // Clear file input visually
      const fileInput = document.getElementById('listingImage-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else {
        // If URL is cleared, and no file is uploaded, clear preview
        if (!imageFile) {
            setImagePreview(null);
        }
    }
    // Trigger validation for both fields when imageUrl changes
    trigger('listingImage');
    trigger('imageUrl');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedImageUrl, setValue, trigger]); // Removed imageFile from deps to avoid circular updates


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    let imagePayload: string | undefined = undefined;

    if (imageFile) {
      try {
        imagePayload = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read image file."));
        });
      } catch (e: any) {
        setError(e.message);
        toast({ title: "Image Read Error", description: e.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
    } else if (data.imageUrl) {
      imagePayload = data.imageUrl;
    }

    if (!imagePayload) {
      setError("Please provide an image (upload or URL).");
      toast({ title: "Image Required", description: "Please provide an image by uploading or entering a URL.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const result = await handleAnalyzeListing({
        image: imagePayload,
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
    setImageFile(null); // This will trigger useEffect to clear listingImage in RHF and preview
    // setImagePreview(null); // No longer needed here, handled by useEffect
    // setValue('imageUrl', ''); // Already handled by reset()
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    const fileInput = document.getElementById('listingImage-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
          setImagePreview={setImagePreview} // Still needed for direct manipulation if any
          setImageFile={setImageFile}
          currentImageUrl={watchedImageUrl} // Value of the URL input field
          uploadedFile={imageFile} // The actual File object
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

        {errors.listingImage && !watchedImageUrl && !imageFile && ( // Show root error if both are missing
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