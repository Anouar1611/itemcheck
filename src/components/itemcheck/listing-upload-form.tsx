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
import { handleAnalyzeOrSearch } from '@/app/actions';
import type { AnalyzeOrSearchOutput } from '@/ai/flows/analyze-or-search-flow';
import { Loader2, UploadCloud, Tag, X, Search, Microscope } from 'lucide-react';

const formSchema = z.object({
  query: z.string().min(3, 'Please enter at least 3 characters.'),
  listingUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  image: z
    .any()
    .optional()
    .refine((file) => !file || (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    )
    .refine((file) => !file || file.size <= 5000000, `Max file size is 5MB.`),
});

type FormData = z.infer<typeof formSchema>;

interface ListingUploadFormProps {
  setIsLoading: (isLoading: boolean) => void;
  setAnalysisResult: (result: AnalyzeOrSearchOutput | null) => void;
  setError: (error: string | null) => void;
}

export function ListingUploadForm({
  setIsLoading,
  setAnalysisResult,
  setError,
}: ListingUploadFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
      listingUrl: '',
      image: null,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file, { shouldValidate: true });
      const newPreview = URL.createObjectURL(file);
      setImagePreview(newPreview);
    }
  };

  const clearImage = () => {
    form.setValue('image', null, { shouldValidate: true });
    setImagePreview(null);
    const fileInput = document.getElementById('image-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    let imagePayloadForApi: string | undefined = undefined;
    if (data.image) {
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
    }

    try {
        const result = await handleAnalyzeOrSearch({
            query: data.query,
            listingUrl: data.listingUrl,
            image: imagePayloadForApi,
        });
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
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-border/60 bg-card overflow-hidden">
      <CardHeader className="text-center p-6 bg-card/50">
        <div className="flex justify-center items-center gap-3">
          <Tag className="h-10 w-10 text-primary" />
          <CardTitle className="text-3xl font-bold">
            ItemCheck AI
          </CardTitle>
        </div>
        <CardDescription className="text-lg text-muted-foreground mt-2">
         Your all-in-one shopping assistant.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

             <div className="space-y-2">
            <Label htmlFor="query">Product Name or Listing Description</Label>
            <Controller
                name="query"
                control={form.control}
                render={({ field }) => (
                <Textarea
                    {...field}
                    id="query"
                    placeholder="Enter a product like 'Sony WH-1000XM5 headphones' OR paste a full item description..."
                    className={`min-h-[150px] text-base resize-y bg-input ${form.formState.errors.query ? 'border-destructive' : ''}`}
                    disabled={form.formState.isSubmitting}
                />
                )}
            />
             <p className="text-sm text-muted-foreground">
                <Search className="inline-block h-4 w-4 mr-1" />
                For a **product search**, enter a product name. <br />
                <Microscope className="inline-block h-4 w-4 mr-1" />
                For a **listing analysis**, paste the full description.
             </p>
            {form.formState.errors.query && <p className="text-sm text-destructive">{form.formState.errors.query.message}</p>}
            </div>

            <div className="space-y-2">
            <Label htmlFor="listingUrl">Listing URL (Optional)</Label>
            <Controller
                name="listingUrl"
                control={form.control}
                render={({ field }) => (
                <Input
                    {...field}
                    id="listingUrl"
                    placeholder="https://www.ebay.com/itm/... (Recommended for listing analysis)"
                    className="bg-input"
                    disabled={form.formState.isSubmitting}
                />
                )}
            />
            {form.formState.errors.listingUrl && <p className="text-sm text-destructive">{form.formState.errors.listingUrl.message}</p>}
            </div>


             <div className="space-y-2">
                <Label htmlFor="image-file">Upload Image (Optional)</Label>
                 <Controller
                    name="image"
                    control={form.control}
                    render={({ field }) => (
                    <div>
                        <div
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                            form.formState.errors.image ? 'border-destructive' : 'border-border'
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
                                disabled={form.formState.isSubmitting}
                                aria-label="Remove image"
                                >
                                <X className="h-4 w-4" />
                                </Button>
                            </div>
                            )}
                        </div>
                        </div>
                        {form.formState.errors.image && <p className="text-sm text-destructive mt-1">{form.formState.errors.image.message as string}</p>}
                    </div>
                    )}
                />
             </div>


            <Button variant="primary" type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? 'Analyzing...' : 'Analyze'}
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}
