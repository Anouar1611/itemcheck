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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, X, Link2 } from 'lucide-react';

interface ListingUploadFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  control: Control<any>; 
  errors: FieldErrors<any>; 
  isLoading: boolean;
  imagePreview: string | null;
  setImagePreview: (value: string | null) => void;
  setImageFile: (file: File | null) => void;
  currentImageUrl?: string; // The current value in the Image URL input field
  uploadedFile: File | null; // The actual File object if one is uploaded
}

export function ListingUploadForm({
  onSubmit,
  control,
  errors,
  isLoading,
  imagePreview,
  setImagePreview,
  setImageFile,
  currentImageUrl,
  uploadedFile,
}: ListingUploadFormProps) {
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Preview will be handled by useEffect in parent ItemCheckPageClient
    } else {
      // If user cancels file selection, only clear if no URL is currently set
      if (!currentImageUrl) {
        setImageFile(null);
        // setImagePreview(null); // Handled by parent
      }
    }
  };

  const clearImage = () => {
    setImageFile(null); // This will trigger parent's useEffect to clear preview and RHF field
    // setImagePreview(null); // Handled by parent
    const fileInput = document.getElementById('listingImage-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    // Clearing RHF field 'listingImage' is handled by parent's useEffect when imageFile becomes null
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">Analyze Listing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="listingImage-file" className="text-base font-medium">Listing Image (Upload)</Label>
            <Controller
              name="listingImage" 
              control={control}
              render={({ fieldState }) => ( // field is not directly used here for input type="file"
                <>
                  <Input
                    id="listingImage-file" 
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className={`file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 ${(fieldState.error && !currentImageUrl && !uploadedFile) ? 'border-destructive' : ''}`}
                    disabled={isLoading || !!currentImageUrl} // Disable if URL is filled
                  />
                  {/* Error for 'listingImage' field from RHF, shown if it's the root error */}
                  {fieldState.error && !currentImageUrl && !uploadedFile && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </>
              )}
            />
            {imagePreview && (
              <div className="mt-4 relative group w-full h-64 border rounded-md overflow-hidden shadow-sm">
                <Image src={imagePreview} alt="Listing preview" layout="fill" objectFit="contain" data-ai-hint="product image" />
                {uploadedFile && ( // Show clear button only if the preview is from an uploaded file
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity"
                    onClick={clearImage}
                    disabled={isLoading}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground my-2">
            OR
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-base font-medium flex items-center">
              <Link2 className="w-4 h-4 mr-2" /> Image URL
            </Label>
            <Controller
              name="imageUrl"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className={`${fieldState.error ? 'border-destructive' : ''}`}
                  {...field}
                  disabled={isLoading || !!uploadedFile} // Disable if a file is uploaded
                />
              )}
            />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message?.toString()}</p>}
          </div>


          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">Listing Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Enter the full listing description here..."
                  className={`min-h-[150px] text-base resize-y ${errors.description ? 'border-destructive' : ''}`}
                  {...field}
                  disabled={isLoading}
                />
              )}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message?.toString()}</p>}
          </div>

          <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <UploadCloud className="mr-2 h-5 w-5" />
                Analyze Listing
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
