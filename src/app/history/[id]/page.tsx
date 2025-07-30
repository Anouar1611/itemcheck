
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UnifiedResults } from '@/components/itemcheck/unified-results';
import { getHistoryItem } from '@/app/actions';
import type { AnalyzeOrSearchOutput } from '@/ai/flows/analyze-or-search-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function HistoryDetailPage() {
  const { id } = useParams();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeOrSearchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (typeof id !== 'string') {
            setError('Invalid analysis ID.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await getHistoryItem(id);
            if (result) {
                setAnalysisResult(result);
            } else {
                setError('Analysis not found.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch analysis details.');
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    });

    return () => unsubscribe();
  }, [id, toast, router]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg font-medium text-foreground">Loading Analysis...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center h-96">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <p className="mt-4 text-lg font-medium text-destructive-foreground">{error}</p>
        </div>
      );
    }

    if (analysisResult) {
      return <UnifiedResults result={analysisResult} />;
    }
    
    return null; // Should be covered by error state
  };


  return (
    <SidebarInset>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6">
            <Button variant="outline" asChild>
                <Link href="/history">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to History
                </Link>
            </Button>
        </div>
        {renderContent()}
      </div>
    </SidebarInset>
  );
}
