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
    <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-card border-border/50">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-3 mb-2">
            <ScanSearch className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-foreground">Analyze Marketplace Listing</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground text-lg">
          Get AI-powered insights into quality, price, and seller reliability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label htmlFor="listingImage-file" className="text-base font-medium text-foreground flex items-center">
                <ImagePlus className="w-5 h-5 mr-2 text-primary" /> Upload Image
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
                      className={`file:text-sm file:font-medium file:text-primary file:bg-transparent hover:file:text-primary/80 ${fieldState.error ? 'border-destructive' : ''}`}
                      disabled={isLoading || !!currentListingUrl}
                    />
                    {fieldState.error && !errors.listingImage?.type?.startsWith('manual') && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                  </>
                )}
              />
              {imagePreview && uploadedFile && (
                <div className="mt-3 relative group w-full aspect-video border-2 border-dashed border-border hover:border-primary transition-colors rounded-lg overflow-hidden shadow-inner bg-muted/20 flex items-center justify-center">
                  <Image src={imagePreview} alt="Listing preview" layout="fill" objectFit="contain" className="p-1" data-ai-hint="product item" />
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
              <div className="relative md:hidden my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">OR</span>
                </div>
              </div>
               <Label htmlFor="listingUrl" className="text-base font-medium text-foreground flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-primary" /> Listing URL
              </Label>
              <Controller
                name="listingUrl"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    id="listingUrl"
                    type="url"
                    placeholder="https://marketplace.com/item-123"
                    className={`${fieldState.error ? 'border-destructive' : ''}`}
                    {...field}
                    disabled={isLoading || !!uploadedFile}
                  />
                )}
              />
              {errors.listingUrl && <p className="text-sm text-destructive mt-1">{errors.listingUrl.message?.toString()}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium text-foreground">Listing Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Enter the full listing description here..."
                  className={`min-h-[140px] text-base resize-y ${errors.description ? 'border-destructive' : ''}`}
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

          <Button type="submit" size="lg" className="w-full text-lg py-7 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" disabled={isLoading}>
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
                <ScanSearch className="mr-2 h-6 w-6" />
                Analyze Listing
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
