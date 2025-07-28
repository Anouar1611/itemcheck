'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { handleProductSearch } from '@/app/actions';
import type { ProductSearchOutput } from '@/ai/flows/product-search-and-analysis-flow';
import { Loader2, Search } from 'lucide-react';

const formSchema = z.object({
  query: z
    .string()
    .min(3, 'Please enter at least 3 characters for your search.'),
});

type FormData = z.infer<typeof formSchema>;

interface SearchFormProps {
  setIsLoading: (isLoading: boolean) => void;
  setSearchResult: (result: ProductSearchOutput | null) => void;
  setError: (error: string | null) => void;
}

export function SearchForm({
  setIsLoading,
  setSearchResult,
  setError,
}: SearchFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setSearchResult(null);
    setError(null);

    try {
      const result = await handleProductSearch(data);
      setSearchResult(result);
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        title: 'Search Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-border/60 bg-card">
      <CardHeader className="text-center p-6 bg-card/50">
        <div className="flex justify-center items-center gap-3">
          <Search className="h-10 w-10 text-primary" />
          <CardTitle className="text-3xl font-bold">Product Search</CardTitle>
        </div>
        <CardDescription className="text-lg text-muted-foreground mt-2">
          Find the best deals, alternatives, and payment options for any product.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="query" className="text-lg">What are you looking for?</Label>
            <Controller
              name="query"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="query"
                  placeholder="e.g., 'wireless noise-cancelling headphones'"
                  className="bg-input text-lg py-6"
                  disabled={form.formState.isSubmitting}
                />
              )}
            />
            {form.formState.errors.query && (
              <p className="text-sm text-destructive">
                {form.formState.errors.query.message}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-full text-lg py-7"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            {form.formState.isSubmitting ? 'Analyzing...' : 'Find Best Deal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
