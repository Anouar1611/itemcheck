'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleAnalyzeListing, handleAnalyzeImageForDamage } from '@/app/actions';
import type { AnalyzeListingOutput } from '@/ai/flows/analyze-listing-flow';
import type { AnalyzeImageForDamageOutput } from '@/ai/flows/analyze-image-damage-flow';
import { Loader2, UploadCloud, FileText, Image as ImageIcon, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchemaText = z.object({
  listingUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  description: z.string().min(20, 'Please enter at least 20 characters for the description.'),
});

const formSchemaImage = z.object({
  image: z
    .any()
    .refine((file) => file, 'Image is required.')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    )
    .refine((file) => file?.size <= 5000000, `Max file size is 5MB.`),
});

type FormDataText = z.infer<typeof formSchemaText>;
type FormDataImage = z.infer<typeof formSchemaImage>;

interface ListingUploadFormProps {
  setIsLoading: (isLoading: boolean) => void;
  setAnalysisResult: (result: AnalyzeListingOutput | null) => void;
  setDamageReport: (report: AnalyzeImageForDamageOutput | null) => void;
  setError: (error: string | null) => void;
}

export function ListingUploadForm({
  setIsLoading,
  setAnalysisResult,
  setDamageReport,
  setError,
}: ListingUploadFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const textForm = useForm<FormDataText>({
    resolver: zodResolver(formSchemaText),
    defaultValues: {
      listingUrl: '',
      description: '',
    },
  });

  const imageForm = useForm<FormDataImage>({
    resolver: zodResolver(formSchemaImage),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      imageForm.setValue('image', file, { shouldValidate: true });
      const newPreview = URL.createObjectURL(file);
      setImagePreview(newPreview);
    }
  };

  const clearImage = () => {
    imageForm.setValue('image', null, { shouldValidate: true });
    setImagePreview(null);
    const fileInput = document.getElementById('image-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };


  const onTextSubmit = async (data: FormDataText) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setDamageReport(null);
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

  const onImageSubmit = async (data: FormDataImage) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setDamageReport(null);
    setError(null);

    let imagePayloadForApi: string;
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
      const result = await handleAnalyzeImageForDamage({ image: imagePayloadForApi });
      setDamageReport(result);
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({ title: 'Analysis Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-border/60 bg-card overflow-hidden">
      <CardHeader className="text-center p-6">
        <CardTitle className="text-3xl font-bold">
          Marketplace Listing Analyzer
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-1">
          Buy smarter. Get an instant AI-powered analysis of any listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="text" className="text-base">
              <FileText className="mr-2 h-5 w-5" />
              Analyze by Text
            </TabsTrigger>
            <TabsTrigger value="image" className="text-base">
              <ImageIcon className="mr-2 h-5 w-5" />
              Analyze by Image
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="pt-6">
            <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="listingUrl">Listing URL (Optional)</Label>
                <Controller
                  name="listingUrl"
                  control={textForm.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="listingUrl"
                      placeholder="https://www.ebay.com/itm/..."
                      className="bg-input"
                      disabled={textForm.formState.isSubmitting}
                    />
                  )}
                />
                {textForm.formState.errors.listingUrl && <p className="text-sm text-destructive">{textForm.formState.errors.listingUrl.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Listing Description</Label>
                <Controller
                  name="description"
                  control={textForm.control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Copy and paste the full item description here..."
                      className={`min-h-[150px] text-base resize-y bg-input ${textForm.formState.errors.description ? 'border-destructive' : ''}`}
                      disabled={textForm.formState.isSubmitting}
                    />
                  )}
                />
                {textForm.formState.errors.description && <p className="text-sm text-destructive">{textForm.formState.errors.description.message}</p>}
              </div>

              <Button variant="primary" type="submit" className="w-full text-lg py-6" disabled={textForm.formState.isSubmitting}>
                {textForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {textForm.formState.isSubmitting ? 'Analyzing...' : 'Analyze Listing'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="image" className="pt-6">
             <form onSubmit={imageForm.handleSubmit(onImageSubmit)} className="space-y-6">
              <Controller
                name="image"
                control={imageForm.control}
                render={({ field }) => (
                  <div>
                    <div
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                        imageForm.formState.errors.image ? 'border-destructive' : 'border-border'
                      }`}
                    >
                      <div className="space-y-1 text-center">
                        {!imagePreview ? (
                          <>
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div className="flex text-sm text-muted-foreground">
                              <label
                                htmlFor="image-file"
                                className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                              >
                                <span>Upload an image</span>
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
                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                          </>
                        ) : (
                          <div className="relative group w-full max-w-sm mx-auto aspect-video rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
                            <Image
                              src={imagePreview}
                              alt="Image preview"
                              fill={true}
                              style={{objectFit: 'contain'}}
                              className="p-1"
                              data-ai-hint="product image"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                              onClick={clearImage}
                              disabled={imageForm.formState.isSubmitting}
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {imageForm.formState.errors.image && <p className="text-sm text-destructive mt-1">{imageForm.formState.errors.image.message as string}</p>}
                  </div>
                )}
              />
              <Button type="submit" variant="primary" className="w-full text-lg py-6" disabled={imageForm.formState.isSubmitting}>
                {imageForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {imageForm.formState.isSubmitting ? 'Analyzing...' : 'Analyze for Damage'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
