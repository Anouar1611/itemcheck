
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserHistory, type HistoryItem } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { History, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userHistory = await getUserHistory();
          setHistory(userHistory);
        } catch (error: any) {
          toast({
            title: 'Error fetching history',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // If user is not logged in, redirect to login page
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [toast, router]);
  
  const getBadgeVariant = (analysisType: string) => {
    return analysisType === 'search' ? 'secondary' : 'default';
  }

  return (
    <SidebarInset>
      <div className="p-4 md:p-6 lg:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Analysis History</CardTitle>
                <CardDescription>Review your past product searches and listing analyses.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Loading History...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">You haven't analyzed anything yet.</p>
                <Button asChild>
                  <Link href="/">Start a New Analysis</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-xs truncate">{item.query}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(item.analysisType)} className="capitalize">
                          {item.analysisType}
                        </Badge>
                      </TableCell>
                       <TableCell>
                        {item.analysisType === 'listing' && item.overallScore !== undefined && (
                          <Badge variant={item.overallScore > 7 ? 'default' : item.overallScore > 4 ? 'secondary' : 'destructive'}>
                            Score: {item.overallScore}/10
                          </Badge>
                        )}
                        {item.analysisType === 'search' && item.recommendation !== undefined && (
                          <Badge variant={item.recommendation ? 'default' : 'destructive'}>
                            {item.recommendation ? <CheckCircle className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
                            {item.recommendation ? 'Recommended' : 'Not Recommended'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/history/${item.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
