
// @ts-nocheck
// TODO: Fix types
"use client";

import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, X, Link as LinkIcon, ImagePlus, ScanSearch } from 'lucide-react';

interface ListingUploadFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  control: Control<any>; 
  errors: FieldErrors<any>; 
  isLoading: boolean;
  imagePreview: string | null;
  setImageFile: (file: File | null) => void;
  currentListingUrl?: string;
  uploadedFile: File | null; 
}

export function ListingUploadForm({
  onSubmit,
  control,
  errors,
  isLoading,
  imagePreview,
  setImageFile,
  currentListingUrl,
  uploadedFile,
}: ListingUploadFormProps) {
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    } else {
      if (!currentListingUrl) {
        setImageFile(null);
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    const fileInput = document.getElementById('listingImage-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl bg-card border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-card-foreground">Analyze Marketplace Listing</CardTitle>
        <CardDescription className="text-muted-foreground">Get AI-powered insights into quality, price, and seller reliability.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label htmlFor="listingImage-file" className="text-base font-medium text-card-foreground flex items-center">
                <ImagePlus className="w-5 h-5 mr-2" /> Upload Image
              </Label>
              <Controller
                name="listingImage" 
                control={control}
                render={({ fieldState }) => ( 
                  <>
                    <Input
                      id="listingImage-file" 
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                      className={`file:text-sm file:font-medium file:text-primary file:bg-transparent hover:file:text-primary/80 border-input focus:ring-ring ${fieldState.error ? 'border-destructive' : 'border-border'}`}
                      disabled={isLoading || !!currentListingUrl}
                    />
                    {fieldState.error && !errors.listingImage?.type?.startsWith('manual') && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                  </>
                )}
              />
              {imagePreview && uploadedFile && (
                <div className="mt-3 relative group w-full aspect-video border border-border rounded-md overflow-hidden shadow-sm bg-muted/20">
                  <Image src={imagePreview} alt="Listing preview" layout="fill" objectFit="contain" data-ai-hint="product item" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity h-7 w-7"
                    onClick={clearImage}
                    disabled={isLoading}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground md:hidden my-2">OR</div>
               <Label htmlFor="listingUrl" className="text-base font-medium text-card-foreground flex items-center">
                <LinkIcon className="w-5 h-5 mr-2" /> Listing URL
              </Label>
              <Controller
                name="listingUrl"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    id="listingUrl"
                    type="url"
                    placeholder="https://marketplace.com/item-123"
                    className={`${fieldState.error ? 'border-destructive' : 'border-border focus:ring-ring'} border-input`}
                    {...field}
                    disabled={isLoading || !!uploadedFile}
                  />
                )}
              />
              {errors.listingUrl && <p className="text-sm text-destructive mt-1">{errors.listingUrl.message?.toString()}</p>}
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground my-0 hidden md:block">
             Provide an image OR a URL
          </div>


          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium text-card-foreground">Listing Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Enter the full listing description here..."
                  className={`min-h-[120px] text-base resize-y ${errors.description ? 'border-destructive' : 'border-border focus:ring-ring'} border-input`}
                  {...field}
                  disabled={isLoading}
                />
              )}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message?.toString()}</p>}
          </div>
          
          {errors.listingImage && errors.listingImage.type === 'manual' && (
             <p className="text-sm text-destructive text-center -mt-2">{errors.listingImage.message?.toString()}</p>
          )}

          <Button type="submit" className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ScanSearch className="mr-2 h-5 w-5" />
                Analyze Listing
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
