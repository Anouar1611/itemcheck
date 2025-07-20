'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAnalyzeImage } from '@/app/actions';
import type { ExtractAndAnalyzeImageOutput } from '@/ai/flows/extract-and-analyze-image-flow';
import { AnalysisResults } from './analysis-results';

const formSchema = z.object({
  image: z
    .any()
    .refine((file) => file, 'Image is required.')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    )
    .refine((file) => file?.size <= 5000000, `Max file size is 5MB.`),
});

type FormData = z.infer<typeof formSchema>;

export function ImageAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<ExtractAndAnalyzeImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('image', file, { shouldValidate: true });
      const newPreview = URL.createObjectURL(file);
      setImagePreview(newPreview);
    }
  };

  const clearImage = () => {
    setValue('image', null, { shouldValidate: true });
    setImagePreview(null);
    const fileInput = document.getElementById('image-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);

    let imagePayloadForApi: string | undefined;
    try {
      imagePayloadForApi = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(data.image);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(new Error('Failed to read image file.'));
      });
    } catch (e: any) {
      toast({ title: 'Image Read Error', description: e.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      const result = await handleAnalyzeImage({
        image: imagePayloadForApi,
      });
      setAnalysisResult(result);
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      toast({ title: 'Analysis Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset({ image: null });
    clearImage();
    setAnalysisResult(null);
  };

  return (
    <Card className="w-full shadow-lg border-border/60">
      <CardHeader>
        <CardTitle>Image & Text Analyzer</CardTitle>
        <CardDescription>Upload a screenshot or image with text to analyze its content.</CardDescription>
      </CardHeader>
      <CardContent>
        {!analysisResult ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <div>
                  <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                      errors.image ? 'border-destructive' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      {!imagePreview ? (
                        <>
                          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label
                              htmlFor="image-file"
                              className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                            >
                              <span>Upload a file</span>
                              <input
                                id="image-file"
                                name="image-file"
                                type="file"
                                className="sr-only"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                        </>
                      ) : (
                        <div className="relative group w-full max-w-sm mx-auto aspect-video rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
                          <Image
                            src={imagePreview}
                            alt="Image preview"
                            fill={true}
                            style={{objectFit: 'contain'}}
                            className="p-1"
                            data-ai-hint="screenshot social media"
                          />
                           <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                            onClick={clearImage}
                            disabled={isLoading}
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message as string}</p>}
                </div>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </Button>
          </form>
        ) : (
          <div>
            <AnalysisResults analysis={analysisResult.analysis} extractedText={analysisResult.extractedText} />
            <Button onClick={handleReset} variant="outline" className="w-full mt-4">
              Analyze Another Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
